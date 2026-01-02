@echo off
chcp 65001 >nul
echo ====================================
echo 生成测试市场数据
echo ====================================
echo.

echo 选择生成方式:
echo 1. 直接插入数据库 (推荐)
echo 2. 通过 API 创建
echo.
set /p choice="请选择 (1 或 2): "

if "%choice%"=="1" (
    echo.
    echo 使用方式 1: 直接插入数据库
    echo.
    cd backend
    node scripts/generateTestData.js
) else if "%choice%"=="2" (
    echo.
    echo 使用方式 2: 通过 API 创建
    echo 注意: 需要确保后端服务正在运行
    echo.
    cd backend
    node scripts/generateTestDataViaAPI.js
) else (
    echo 无效选择
    pause
    exit /b 1
)

echo.
echo 完成！
pause

