# KramerLab — Sistemas de ecuaciones 3×3

Aplicación web educativa en Python + Flask para resolver sistemas de tres ecuaciones lineales con la regla de Cramer.

## Requisitos
- Python 3.9 o superior
- Flask

## Instalación y ejecución
1. Descomprime el proyecto.
2. Abre una terminal dentro de la carpeta `kramer_3x3_web`.
3. Instala Flask:
   ```bash
   python -m pip install -r requirements.txt
   ```
4. Ejecuta:
   ```bash
   python app.py
   ```
5. Abre en tu navegador: http://127.0.0.1:5000

En Garuda/Linux, si el comando `python` no funciona, prueba `python3`.

## Qué incluye
- Diseño oscuro con detalles en turquesa y azul, adaptable a móvil y computadora.
- Campos editables para los 12 valores del sistema.
- Ejemplo precargado basado en el estilo de los apuntes.
- Matriz de coeficientes A y vector B.
- Determinantes calculados con la regla de Sarrus, mostrando productos de diagonales descendentes y ascendentes.
- Matrices Δx, Δy y Δz con la columna reemplazada resaltada.
- Fórmulas de Cramer y resultado final.
- Aviso cuando Δ = 0 y no existe una solución única por Cramer.

La aplicación calcula con números reales. El resultado se muestra redondeado para facilitar la lectura.
