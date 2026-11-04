Add-Type -AssemblyName System.Net.Http
$base = 'http://localhost:3000'

function Test-Api {
    param(
        [Parameter(Mandatory = $true)] [string] $Method,
        [Parameter(Mandatory = $true)] [string] $Path,
        [Parameter(Mandatory = $true)] [int] $Expected,
        [object]$Body,
        [string]$Token = ""
    )
    $client = [System.Net.Http.HttpClient]::new()
    $client.Timeout = [TimeSpan]::FromSeconds(10)
    $request = [System.Net.Http.HttpRequestMessage]::new(
        [System.Net.Http.HttpMethod]::new($Method),
        "$base$Path"
    )
    $response = $null
    try {
        $request.Headers.Accept.ParseAdd('application/json')
        if ($Token) {
            $request.Headers.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Bearer', $Token)
        }
        if ($PSBoundParameters.ContainsKey('Body')) {
            $json = ConvertTo-Json -InputObject $Body -Depth 8 -Compress
            $request.Content = [System.Net.Http.StringContent]::new(
                $json, [System.Text.Encoding]::UTF8, 'application/json'
            )
        }
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        $status = [int]$response.StatusCode
        $raw = $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
        $data = $null
        if (-not [string]::IsNullOrWhiteSpace($raw)) {
            $data = ConvertFrom-Json -InputObject $raw -ErrorAction Stop
        }
        if ($status -ne $Expected) {
            throw "FALLO: $Method $Path devolvio HTTP $status; se esperaba $Expected."
        }
        Write-Host "[OK] $Method $Path -> HTTP $status (esperado $Expected)"
        return [pscustomobject]@{ Status = $status; Data = $data; Raw = $raw }
    } finally {
        if ($null -ne $response) { $response.Dispose() }
        $request.Dispose()
        $client.Dispose()
    }
}

function Assert-Api {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) { throw "FALLO: $Message" }
    Write-Host "[OK] $Message"
}

# 1. Registrar Alicia y Bruno
$suffix = [guid]::NewGuid().ToString('N')
$aliceEmail = "alicia.$suffix@example.test"
$bobEmail = "bruno.$suffix@example.test"
$password = 'Aprender-DAW-2026-Alicia!'

$aliceSignup = Test-Api -Method POST -Path '/auth/signup' -Expected 201 -Body @{ email = $aliceEmail; password = $password; name = 'Alicia' }
$bobSignup = Test-Api -Method POST -Path '/auth/signup' -Expected 201 -Body @{ email = $bobEmail; password = $password; name = 'Bruno' }

$aliceToken = $aliceSignup.Data.access_token
$bobToken = $bobSignup.Data.access_token

$aliceIdentity = Test-Api -Method GET -Path '/auth/me' -Expected 200 -Token $aliceToken
$bobIdentity = Test-Api -Method GET -Path '/auth/me' -Expected 200 -Token $bobToken
$aliceMe = $aliceIdentity.Data
$bobMe = $bobIdentity.Data

Write-Host "--- Entorno listo. Cuentas operativas. ---"

# 2. Prueba de Creación y Listado (Positiva)
$courseCode = "INF-$((Get-Random -Minimum 100 -Maximum 999))"
$created = Test-Api -Method POST -Path /courses -Expected 201 -Token $aliceToken -Body @{
    code = $courseCode
    name = "Bases de Datos"
    term = "2026-1"
}
$course = $created.Data
Assert-Api ($course.professorId -eq $aliceMe.sub) "La API asigno a Alicia como profesora/propietaria."

$aliceList = Test-Api -Method GET -Path '/courses?skip=0&take=20' -Expected 200 -Token $aliceToken
$bobList = Test-Api -Method GET -Path '/courses?skip=0&take=20' -Expected 200 -Token $bobToken

$foundCourse = $aliceList.Data | Where-Object { $_.id -eq $course.id }
Assert-Api ($null -ne $foundCourse) "Alicia ve su asignatura."
Assert-Api ($bobList.Raw.Trim() -eq '[]') "Bruno no tiene asignaturas y recibe un arreglo vacio."

# 3. Pruebas Negativas y de Seguridad
# 3.1 Acceso sin token (401)
Test-Api -Method GET -Path '/courses' -Expected 401 | Out-Null
Write-Host "[OK] Acceso sin token rechazado con HTTP 401."

# 3.2 Bruno intenta leer el curso de Alicia (404 por aislamiento)
Test-Api -Method GET -Path "/courses/$($course.id)" -Expected 404 -Token $bobToken | Out-Null
Write-Host "[OK] Bruno no puede leer el curso de Alicia (HTTP 404)."

# 3.3 Bruno intenta actualizar el curso de Alicia (404)
Test-Api -Method PATCH -Path "/courses/$($course.id)" -Expected 404 -Token $bobToken -Body @{
    name = "Hackeado por Bruno"
} | Out-Null
Write-Host "[OK] Bruno no puede actualizar el curso de Alicia (HTTP 404)."

# 3.4 Bruno intenta eliminar el curso de Alicia (404)
Test-Api -Method DELETE -Path "/courses/$($course.id)" -Expected 404 -Token $bobToken | Out-Null
Write-Host "[OK] Bruno no puede eliminar el curso de Alicia (HTTP 404)."

# 3.5 Validación de DTO (400 Bad Request por campos vacíos o inválidos)
Test-Api -Method POST -Path /courses -Expected 400 -Token $aliceToken -Body @{
    code = ""
    name = ""
    term = ""
} | Out-Null
Write-Host "[OK] Validacion de DTO rechaza datos vacios con HTTP 400."

Write-Host "--- ¡TODAS LAS PRUEBAS (POSITIVAS Y NEGATIVAS) SUPERADAS CON ÉXITO! ---"
