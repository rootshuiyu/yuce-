@echo off
echo ====================================
echo 启动 MongoDB
echo ====================================
echo.

REM 检查常见安装路径
set MONGODB_PATH=
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\7.0\bin
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\5.0\bin
) else if exist "C:\mongodb\bin\mongod.exe" (
    set MONGODB_PATH=C:\mongodb\bin
)

if "%MONGODB_PATH%"=="" (
    echo 错误: 未找到 MongoDB 安装路径
    echo 请手动设置 MONGODB_PATH 变量
    echo.
    echo 或者手动运行:
    echo   mongod --dbpath C:\data\db
    pause
    exit /b 1
)

echo 找到 MongoDB: %MONGODB_PATH%
echo.

REM 创建数据目录
if not exist "C:\data\db" (
    echo 创建数据目录: C:\data\db
    mkdir C:\data\db
)

REM 检查是否已在运行
netstat -ano | findstr :27017 >nul
if %errorlevel% == 0 (
    echo MongoDB 似乎已在运行（端口 27017 被占用）
    echo 如果无法连接，请先停止现有进程
    pause
    exit /b 0
)

REM 启动 MongoDB
echo 启动 MongoDB 服务器...
cd /d "%MONGODB_PATH%"
start "MongoDB Server" mongod.exe --dbpath C:\data\db

echo.
echo MongoDB 已启动！
echo 请保持此窗口打开，或查看新打开的 MongoDB 窗口
echo.
echo 按任意键关闭此窗口（MongoDB 将继续在后台运行）...
pause >nul


