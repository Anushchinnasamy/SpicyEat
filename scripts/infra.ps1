<#
.SYNOPSIS
  Manage local infrastructure containers (Redis, Kafka) for SpicyEat via plain
  `podman run` — no docker-compose/podman-compose provider required.

  Postgres is NOT managed here: this machine already has a native PostgreSQL
  18 Windows service listening on 5432, so we use that directly instead of
  running a second Postgres in a container on the same port. See
  backend/infrastructure/postgres/init-databases.sh for the database list —
  the spicyeat role and spicyeat_* databases were created once against the
  native instance and don't need to be recreated by this script.

.EXAMPLES
  ./scripts/infra.ps1 up                      # start redis + kafka
  ./scripts/infra.ps1 up -Services redis
  ./scripts/infra.ps1 status
  ./scripts/infra.ps1 logs kafka
  ./scripts/infra.ps1 down                    # stop redis + kafka
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet("up", "down", "status", "logs")]
    [string]$Action = "up",

    [ValidateSet("redis", "kafka")]
    [string[]]$Services = @("redis", "kafka"),

    [string]$Container
)

$ErrorActionPreference = "Stop"

function Test-ContainerExists($name) {
    $existing = podman ps -a --format "{{.Names}}" | Select-String -Pattern "^$name$"
    return [bool]$existing
}

function Test-ContainerRunning($name) {
    $running = podman ps --format "{{.Names}}" | Select-String -Pattern "^$name$"
    return [bool]$running
}

function Start-Redis {
    $name = "spicyeat-redis"
    if (Test-ContainerRunning $name) { Write-Host "$name already running"; return }
    if (Test-ContainerExists $name) { podman start $name | Out-Null; Write-Host "$name started"; return }

    podman run -d --name $name -p 6379:6379 docker.io/library/redis:7-alpine | Out-Null
    Write-Host "$name created and started"
}

function Start-Kafka {
    $name = "spicyeat-kafka"
    if (Test-ContainerRunning $name) { Write-Host "$name already running"; return }
    if (Test-ContainerExists $name) { podman start $name | Out-Null; Write-Host "$name started"; return }

    podman run -d --name $name `
        -p 9092:9092 `
        -e KAFKA_NODE_ID=1 `
        -e KAFKA_PROCESS_ROLES=broker,controller `
        -e KAFKA_LISTENERS="PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093" `
        -e KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092" `
        -e KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER `
        -e KAFKA_LISTENER_SECURITY_PROTOCOL_MAP="CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT" `
        -e KAFKA_CONTROLLER_QUORUM_VOTERS="1@localhost:9093" `
        -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
        -e KAFKA_AUTO_CREATE_TOPICS_ENABLE=true `
        docker.io/apache/kafka:3.8.0 | Out-Null
    Write-Host "$name created and started"
}

switch ($Action) {
    "up" {
        foreach ($svc in $Services) {
            switch ($svc) {
                "postgres" { Start-Postgres }
                "redis" { Start-Redis }
                "kafka" { Start-Kafka }
            }
        }
        Write-Host "`nWaiting a few seconds for containers to become healthy..."
        Start-Sleep -Seconds 5
        podman ps --filter "name=spicyeat-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
    "down" {
        foreach ($svc in $Services) {
            $name = "spicyeat-$svc"
            if (Test-ContainerExists $name) {
                podman stop $name | Out-Null
                podman rm $name | Out-Null
                Write-Host "$name stopped and removed"
            }
        }
    }
    "status" {
        podman ps -a --filter "name=spicyeat-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    }
    "logs" {
        if (-not $Container) { $Container = "redis" }
        podman logs -f "spicyeat-$Container"
    }
}
