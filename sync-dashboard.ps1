Add-Type -AssemblyName PresentationFramework

# Endpoints
$workerUrls = @(
    "https://ecosmarthomes-site.joehr4838.workers.dev/status",
    "https://ecosmarthomes-site.joshllorr.workers.dev/status"
)
$prodUrl   = "https://www.ecosmarthomes.ie/status"

# XAML UI
$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        Title="EcoSmartHomes Sync Dashboard"
        Height="320" Width="520"
        WindowStartupLocation="CenterScreen"
        ResizeMode="NoResize">
  <Grid Margin="10">
    <Grid.RowDefinitions>
      <RowDefinition Height="Auto"/>
      <RowDefinition Height="*"/>
      <RowDefinition Height="Auto"/>
    </Grid.RowDefinitions>

    <StackPanel Grid.Row="0" Margin="0,0,0,10">
      <TextBlock Text="EcoSmartHomes Sync Dashboard" FontSize="20" FontWeight="Bold"/>
      <TextBlock Text="Cloudflare Worker ↔ Vercel Production" FontSize="12" Foreground="Gray"/>
    </StackPanel>

    <Grid Grid.Row="1">
      <Grid.RowDefinitions>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="Auto"/>
        <RowDefinition Height="*"/>
      </Grid.RowDefinitions>

      <Grid.ColumnDefinitions>
        <ColumnDefinition Width="*"/>
        <ColumnDefinition Width="*"/>
      </Grid.ColumnDefinitions>

      <!-- Worker -->
      <TextBlock Grid.Row="0" Grid.Column="0" Text="Worker Status" FontWeight="Bold"/>
      <TextBlock Grid.Row="1" Grid.Column="0" Name="WorkerStatus" Text="-" Margin="0,2,0,0"/>
      <TextBlock Grid.Row="2" Grid.Column="0" Name="WorkerVersion" Text="Version: -" Margin="0,2,0,0"/>

      <!-- Prod -->
      <TextBlock Grid.Row="0" Grid.Column="1" Text="Vercel Status" FontWeight="Bold"/>
      <TextBlock Grid.Row="1" Grid.Column="1" Name="ProdStatus" Text="-" Margin="0,2,0,0"/>
      <TextBlock Grid.Row="2" Grid.Column="1" Name="ProdVersion" Text="Version: -" Margin="0,2,0,0"/>

      <!-- Drift -->
      <TextBlock Grid.Row="3" Grid.ColumnSpan="2" Name="DriftLabel" Text="Drift: -" FontSize="14" FontWeight="Bold" Margin="0,10,0,0"/>
    </Grid>

    <StackPanel Grid.Row="2" Orientation="Horizontal" HorizontalAlignment="Right" Margin="0,10,0,0">
      <Button Name="SyncButton" Content="Run Sync Check" Width="130" Margin="0,0,10,0"/>
      <Button Name="CloseButton" Content="Close" Width="80"/>
    </StackPanel>
  </Grid>
</Window>
"@

$reader = New-Object System.Xml.XmlNodeReader ([xml]$xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$WorkerStatus  = $window.FindName("WorkerStatus")
$WorkerVersion = $window.FindName("WorkerVersion")
$ProdStatus    = $window.FindName("ProdStatus")
$ProdVersion   = $window.FindName("ProdVersion")
$DriftLabel    = $window.FindName("DriftLabel")
$SyncButton    = $window.FindName("SyncButton")
$CloseButton   = $window.FindName("CloseButton")

function Get-StatusJson($url) {
    try {
        $raw = (Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 10).Content
        return $raw, ($raw | ConvertFrom-Json)
    } catch {
        return $null, $null
    }
}

function Get-WorkerStatusJson {
    foreach ($url in $workerUrls) {
        $raw, $obj = Get-StatusJson $url
        if ($obj) { return $raw, $obj }
    }
    return $null, $null
}

function Run-SyncCheck {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

    $workerRaw, $worker = Get-WorkerStatusJson
    $prodRaw,   $prod   = Get-StatusJson $prodUrl

    if (-not $worker) {
        $WorkerStatus.Text  = "Unreachable"
        $WorkerVersion.Text = "Version: -"
    } else {
        $WorkerStatus.Text  = "Status: " + $worker.status
        $WorkerVersion.Text = "Version: " + $worker.workerVersion
    }

    if (-not $prod) {
        $ProdStatus.Text    = "DNS Pending"
        $ProdVersion.Text   = "Version: -"
    } else {
        $ProdStatus.Text    = "Status: " + $prod.status
        $ProdVersion.Text   = "Version: " + $prod.workerVersion
    }

    if ($workerRaw -and $prodRaw -and ($workerRaw -eq $prodRaw)) {
        $DriftLabel.Text = "Drift: In Sync ($timestamp)"
        $DriftLabel.Foreground = "Green"
    } elseif ($workerRaw -and -not $prodRaw) {
        $DriftLabel.Text = "Cloudflare Edge Active ($timestamp)"
        $DriftLabel.Foreground = "Green"
    } else {
        $DriftLabel.Text = "Drift: Mismatch ($timestamp)"
        $DriftLabel.Foreground = "Orange"
    }
}

$SyncButton.Add_Click({ Run-SyncCheck })
$CloseButton.Add_Click({ $window.Close() })

# Run once on open
Run-SyncCheck

$window.ShowDialog() | Out-Null
