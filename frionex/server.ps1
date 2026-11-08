param(
  [int]$Port = 8765
)

# Servidor estático mínimo para rodar o protótipo Frionex sem Node/Python.
# Uso: powershell -ExecutionPolicy Bypass -File server.ps1
$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Frionex disponivel em http://localhost:$Port/" -ForegroundColor Cyan
Write-Host "Pasta: $root"
Write-Host "Pressione Ctrl+C para encerrar."

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response

    try {
      $path = [System.Uri]::UnescapeDataString($req.Url.LocalPath)
      if ($path -eq '/') { $path = '/index.html' }

      $relative = $path.TrimStart('/') -replace '/', '\'
      $file = Join-Path $root $relative
      $full = [System.IO.Path]::GetFullPath($file)
      $rootFull = [System.IO.Path]::GetFullPath($root)

      if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $res.StatusCode = 403
      } elseif (Test-Path -LiteralPath $full -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $mime = switch ($ext) {
          '.html' { 'text/html; charset=utf-8' }
          '.css'  { 'text/css; charset=utf-8' }
          '.js'   { 'application/javascript; charset=utf-8' }
          '.json' { 'application/json; charset=utf-8' }
          '.pdf'  { 'application/pdf' }
          '.png'  { 'image/png' }
          '.jpg'  { 'image/jpeg' }
          '.jpeg' { 'image/jpeg' }
          '.svg'  { 'image/svg+xml' }
          '.ico'  { 'image/x-icon' }
          default { 'application/octet-stream' }
        }
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $res.ContentType = $mime
        $res.Headers.Add('Cache-Control', 'no-store')
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes('404 - arquivo nao encontrado')
        $res.ContentType = 'text/plain; charset=utf-8'
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch {
      $res.StatusCode = 500
    } finally {
      $res.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
}
