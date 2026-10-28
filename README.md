# KramerLab — Sistemas de ecuaciones lineales

Aplicación web educativa en Python + Flask para resolver sistemas de dos o tres ecuaciones lineales con la regla de Cramer.

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
- Selector para resolver sistemas 2×2 o 3×3.
- Campos editables que se adaptan al número de incógnitas elegido.
- Ejemplos de sistemas 2×2 y 3×3.
- Matriz de coeficientes A y vector B.
- Determinantes 2×2 y regla de Sarrus para matrices 3×3, con el procedimiento mostrado.
- Matrices sustitutas y fórmulas de Cramer para cada incógnita.
- Fórmulas de Cramer y resultado final.
- Aviso cuando Δ = 0 y no existe una solución única por Cramer.

La aplicación calcula con números reales. El resultado se muestra redondeado para facilitar la lectura.
