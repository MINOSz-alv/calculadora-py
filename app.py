from math import isfinite

from flask import Flask, jsonify, render_template, request

app = Flask(__name__)


def determinant(matrix):
    if len(matrix) == 2:
        a, b = matrix[0]
        c, d = matrix[1]
        positive = [a * d]
        negative = [b * c]
    else:
        a, b, c = matrix[0]
        d, e, f = matrix[1]
        g, h, i = matrix[2]
        positive = [a * e * i, b * f * g, c * d * h]
        negative = [c * e * g, b * d * i, a * f * h]
    return sum(positive) - sum(negative), positive, negative


def fmt(number):
    if abs(number - round(number)) < 1e-10:
        return str(int(round(number)))
    return f"{number:.6g}"


def solve_system(data, size):
    variables = ["x", "y", "z"][:size]
    matrix = [
        [float(data[f"a{row}{column}"]) for column in range(1, size + 1)]
        for row in range(1, size + 1)
    ]
    constants = [float(data[f"b{row}"]) for row in range(1, size + 1)]

    det_a, positive, negative = determinant(matrix)
    replacements = []
    for column, variable in enumerate(variables):
        replaced = [
            [constants[row] if current_column == column else matrix[row][current_column]
             for current_column in range(size)]
            for row in range(size)
        ]
        det, det_positive, det_negative = determinant(replaced)
        replacements.append({
            "variable": variable,
            "matrix": replaced,
            "det": det,
            "steps": {"positive": det_positive, "negative": det_negative},
        })

    result = {
        "size": size,
        "variables": variables,
        "A": matrix,
        "B": constants,
        "detA": det_a,
        "det_steps": {"positive": positive, "negative": negative},
        "replacements": replacements,
    }

    if abs(det_a) < 1e-10:
        result["unique"] = False
        result["message"] = (
            "El determinante principal es 0. La regla de Cramer no permite obtener "
            "una solución única para este sistema. Puede tener infinitas soluciones o ninguna."
        )
    else:
        solution = {
            replacement["variable"]: replacement["det"] / det_a
            for replacement in replacements
        }
        result["unique"] = True
        result["solution"] = solution
        result["solution_formatted"] = {
            variable: fmt(value) for variable, value in solution.items()
        }
    return result


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/resolver", methods=["POST"])
def resolver():
    try:
        data = request.get_json(force=True)
        if not isinstance(data, dict):
            return jsonify({"error": "Envía los datos del sistema en un formato válido."}), 400
        size = data.get("size")
        if type(size) is not int or size not in (2, 3):
            return jsonify({"error": "Selecciona un sistema de 2×2 o de 3×3."}), 400

        required = [
            f"a{row}{column}"
            for row in range(1, size + 1)
            for column in range(1, size + 1)
        ] + [f"b{row}" for row in range(1, size + 1)]
        for key in required:
            if key not in data or str(data[key]).strip() == "":
                return jsonify({"error": f"Falta ingresar el valor {key}."}), 400
            if not isfinite(float(data[key])):
                return jsonify({"error": "Ingresa solamente números válidos en todos los campos."}), 400
        return jsonify(solve_system(data, size))
    except (ValueError, TypeError):
        return jsonify({"error": "Ingresa solamente números válidos en todos los campos."}), 400


if __name__ == "__main__":
    app.run(debug=True)
