@echo off
cd /d "%~dp0"
python scripts\atualizar_catalogo.py
if errorlevel 1 (echo Nao foi possivel atualizar. Verifique se o Python esta instalado.) else (echo Fotos e catalogos atualizados. Pode enviar os arquivos ao servidor.)
pause
