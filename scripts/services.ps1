<#
.SYNOPSIS
  Start/stop individual SpicyEat Spring Boot services on localhost (never in Podman).
  Reads secrets/overrides from backend/.env.local if present (copy from
  backend/.env.local.example). Everything else defaults to localhost, matching
  each service's application.yml.

.EXAMPLES
  ./scripts/services.ps1 up -Preset auth        # gateway + auth + its deps
  ./scripts/services.ps1 up -Preset menu
  ./scripts/services.ps1 up -Preset cart
  ./scripts/services.ps1 up -Preset order-payment
  ./scripts/services.ps1 up -Services gateway,menu-service
  ./scripts/services.ps1 status
  ./scripts/services.ps1 logs auth-service
  ./scripts/services.ps1 down                    # stops everything started this way
  ./scripts/services.ps1 down -Services menu-service
#>
param(
    [Parameter(Position = 0)]
    [ValidateSet("up", "down", "status", "logs")]
    [string]$Action = "up",

    [ValidateSet("auth", "menu", "cart", "order-payment", "delivery", "notification", "all")]
    [string]$Preset,

    [ValidateSet("api-gateway", "auth-service", "user-service", "menu-service", "cart-service",
                 "order-service", "payment-service", "delivery-service", "notification-service")]
    [string[]]$Services,

    [string]$Container
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $PSScriptRoot
$BackendDir = Join-Path $RepoRoot "backend"
$RunDir = Join-Path $RepoRoot ".run"
$LogDir = Join-Path $RunDir "logs"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

$EnvLocalPath = Join-Path $BackendDir ".env.local"

$Presets = @{
    "auth"           = @("api-gateway", "auth-service", "user-service", "notification-service")
    "menu"           = @("api-gateway", "menu-service")
    "cart"           = @("api-gateway", "cart-service", "menu-service")
    "order-payment"  = @("api-gateway", "order-service", "payment-service", "cart-service", "menu-service", "user-service")
    "delivery"       = @("api-gateway", "delivery-service", "order-service")
    "notification"   = @("api-gateway", "notification-service", "auth-service")
    "all"            = @("api-gateway", "auth-service", "user-service", "menu-service", "cart-service",
                          "order-service", "payment-service", "delivery-service", "notification-service")
}

function Get-LocalEnv {
    $envVars = @{}
    if (Test-Path $EnvLocalPath) {
        Get-Content $EnvLocalPath | ForEach-Object {
            if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
            $parts = $_ -split '=', 2
            if ($parts.Length -eq 2) { $envVars[$parts[0].Trim()] = $parts[1].Trim() }
        }
    }
    return $envVars
}

function Start-OneService($name) {
    $pidFile = Join-Path $RunDir "$name.pid"
    if (Test-Path $pidFile) {
        $existingPid = Get-Content $pidFile
        if (Get-Process -Id $existingPid -ErrorAction SilentlyContinue) {
            Write-Host "$name already running (PID $existingPid)"
            return
        }
    }

    $localEnv = Get-LocalEnv
    foreach ($key in $localEnv.Keys) { [System.Environment]::SetEnvironmentVariable($key, $localEnv[$key], "Process") }

    $logFile = Join-Path $LogDir "$name.log"
    Write-Host "Starting $name (log: $logFile) ..."
    # Use -f (single module) rather than -pl/-am: invoking a CLI plugin goal
    # against a reactor runs it on every reactor member, including the
    # parent "pom"-packaged project and common, which have no main class.
    $proc = Start-Process -FilePath "mvn" `
        -ArgumentList @("-q", "-f", "$name/pom.xml", "spring-boot:run") `
        -WorkingDirectory $BackendDir `
        -RedirectStandardOutput $logFile `
        -RedirectStandardError "$logFile.err" `
        -PassThru -WindowStyle Hidden

    $proc.Id | Set-Content -Path (Join-Path $RunDir "$name.pid")
    Write-Host "$name started (PID $($proc.Id))"
}

function Stop-OneService($name) {
    $pidFile = Join-Path $RunDir "$name.pid"
    if (-not (Test-Path $pidFile)) { Write-Host "$name is not tracked as running"; return }
    $trackedPid = Get-Content $pidFile
    if (Get-Process -Id $trackedPid -ErrorAction SilentlyContinue) {
        # `mvn spring-boot:run` forks a child java process running the actual
        # app; Stop-Process on just the mvn PID leaves that child orphaned
        # and still holding the port. taskkill /T kills the whole tree.
        taskkill /F /T /PID $trackedPid | Out-Null
        Write-Host "$name stopped (PID $trackedPid)"
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}

function Resolve-Targets {
    if ($Preset) { return $Presets[$Preset] }
    if ($Services) { return $Services }
    throw "Specify -Preset <auth|menu|cart|order-payment|delivery|notification|all> or -Services <name,...>"
}

switch ($Action) {
    "up" {
        $targets = Resolve-Targets
        $commonBuiltMarker = Join-Path $RunDir "common-built"
        if (-not (Test-Path $commonBuiltMarker)) {
            Write-Host "Building shared 'common' module (first run only)..."
            & mvn -q -f (Join-Path $BackendDir "common\pom.xml") install -DskipTests
            if ($LASTEXITCODE -ne 0) { throw "Failed to build common module" }
            New-Item -ItemType File -Path $commonBuiltMarker -Force | Out-Null
        }
        Write-Host "Starting: $($targets -join ', ')"
        Write-Host "(Make sure required infra is up: ./scripts/infra.ps1 up)`n"
        foreach ($svc in $targets) { Start-OneService $svc }
    }
    "down" {
        $targets = if ($Preset) { $Presets[$Preset] } elseif ($Services) { $Services } else {
            Get-ChildItem $RunDir -Filter "*.pid" | ForEach-Object { $_.BaseName }
        }
        foreach ($svc in $targets) { Stop-OneService $svc }
    }
    "status" {
        Get-ChildItem $RunDir -Filter "*.pid" -ErrorAction SilentlyContinue | ForEach-Object {
            $name = $_.BaseName
            $trackedPid = Get-Content $_.FullName
            $alive = Get-Process -Id $trackedPid -ErrorAction SilentlyContinue
            Write-Host "$name`t PID $trackedPid`t $(if ($alive) { 'RUNNING' } else { 'STOPPED (stale pid file)' })"
        }
    }
    "logs" {
        if (-not $Container) { throw "Specify -Container <service-name>" }
        Get-Content (Join-Path $LogDir "$Container.log") -Wait -Tail 50
    }
}
