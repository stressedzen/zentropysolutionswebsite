<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, max-age=0');

$allowedIds = [
  'boot-sequence',
  'memory-loss',
  'body-horror',
  'into-analog',
  'hoomans',
  'consume',
  'patch-notes',
  'contraband-pulse',
  'kult',
];

$storePath = __DIR__ . '/track-counts.json';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

function respond(array $payload, int $status = 200): void
{
  http_response_code($status);
  echo json_encode(
    $payload,
    JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
  );
  exit;
}

function initialState(array $allowedIds): array
{
  $counts = [];

  foreach ($allowedIds as $id) {
    $counts[$id] = 0;
  }

  return ['counts' => $counts];
}

function normalizeState(?array $decoded, array $allowedIds): array
{
  $state = initialState($allowedIds);

  if (!is_array($decoded) || !isset($decoded['counts']) || !is_array($decoded['counts'])) {
    return $state;
  }

  foreach ($allowedIds as $id) {
    $value = $decoded['counts'][$id] ?? 0;
    $state['counts'][$id] = is_numeric($value) ? max(0, (int) $value) : 0;
  }

  return $state;
}

function readState(string $storePath, array $allowedIds): array
{
  $handle = fopen($storePath, 'c+');

  if ($handle === false) {
    respond(['error' => 'Unable to open count store'], 500);
  }

  if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    respond(['error' => 'Unable to lock count store'], 500);
  }

  rewind($handle);
  $raw = stream_get_contents($handle);
  $raw = is_string($raw) ? trim($raw) : '';
  $decoded = $raw !== '' ? json_decode($raw, true) : null;
  $state = normalizeState(is_array($decoded) ? $decoded : null, $allowedIds);
  $shouldPersist = $raw === '' || !is_array($decoded) || !isset($decoded['counts']) || !is_array($decoded['counts']);

  return [$handle, $state, $shouldPersist];
}

function writeState($handle, array $state): void
{
  rewind($handle);
  ftruncate($handle, 0);
  fwrite(
    $handle,
    json_encode(
      $state,
      JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    ) . PHP_EOL
  );
  fflush($handle);
  flock($handle, LOCK_UN);
  fclose($handle);
}

if (!in_array($method, ['GET', 'POST'], true)) {
  respond(['error' => 'Method not allowed'], 405);
}

[$handle, $state, $shouldPersist] = readState($storePath, $allowedIds);

if ($method === 'POST') {
  $payload = json_decode(file_get_contents('php://input') ?: '', true);
  $trackId = is_array($payload) && isset($payload['trackId']) ? trim((string) $payload['trackId']) : '';

  if ($trackId === '' || !in_array($trackId, $allowedIds, true)) {
    flock($handle, LOCK_UN);
    fclose($handle);
    respond(['error' => 'Invalid track id'], 400);
  }

  $state['counts'][$trackId] = (int) $state['counts'][$trackId] + 1;
  $shouldPersist = true;
}

if ($shouldPersist) {
  writeState($handle, $state);
} else {
  flock($handle, LOCK_UN);
  fclose($handle);
}

respond($state);
