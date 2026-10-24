from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

def determinant_sarrus(m):
    # Regla de Sarrus: diagonales descendentes menos diagonales ascendentes.
    a, b, c = m[0]
    d, e, f = m[1]
    g, h, i = m[2]
    positive = [a*e*i, b*f*g, c*d*h]
    negative = [c*e*g, b*d*i, a*f*h]
    return sum(positive) - sum(negative), positive, negative

def fmt(n):
    if abs(n - round(n)) < 1e-10:
        return str(int(round(n)))
    return f"{n:.6g}"

def solve_system(data):
    A = [
        [float(data["a11"]), float(data["a12"]), float(data["a13"])],
        [float(data["a21"]), float(data["a22"]), float(data["a23"])],
        [float(data["a31"]), float(data["a32"]), float(data["a33"])],
    ]
    B = [float(data["b1"]), float(data["b2"]), float(data["b3"])]

    Ax = [[B[r] if c == 0 else A[r][c] for c in range(3)] for r in range(3)]
    Ay = [[A[r][0] if c == 0 else B[r] if c == 1 else A[r][2] for c in range(3)] for r in range(3)]
    Az = [[A[r][0] if c == 0 else A[r][1] if c == 1 else B[r] for c in range(3)] for r in range(3)]

    detA, posA, negA = determinant_sarrus(A)
    detX, posX, negX = determinant_sarrus(Ax)
    detY, posY, negY = determinant_sarrus(Ay)
    detZ, posZ, negZ = determinant_sarrus(Az)

    result = {
        "A": A, "B": B, "Ax": Ax, "Ay": Ay, "Az": Az,
        "detA": detA, "detX": detX, "detY": detY, "detZ": detZ,
        "det_steps": {
            "A": {"positive": posA, "negative": negA},
            "Ax": {"positive": posX, "negative": negX},
            "Ay": {"positive": posY, "negative": negY},
            "Az": {"positive": posZ, "negative": negZ},
        },
        "formatted": {
            "detA": fmt(detA), "detX": fmt(detX), "detY": fmt(detY), "detZ": fmt(detZ)
        }
    }

    if abs(detA) < 1e-10:
        result["unique"] = False
        result["message"] = (
            "El determinante principal es 0. La regla de Cramer no permite obtener "
            "una solución única para este sistema. Puede tener infinitas soluciones o ninguna."
        )
    else:
        x, y, z = detX/detA, detY/detA, detZ/detA
        result["unique"] = True
        result["solution"] = {"x": x, "y": y, "z": z}
        result["solution_formatted"] = {"x": fmt(x), "y": fmt(y), "z": fmt(z)}
    return result

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/resolver", methods=["POST"])
def resolver():
    try:
        data = request.get_json(force=True)
        required = [f"a{r}{c}" for r in range(1,4) for c in range(1,4)] + ["b1", "b2", "b3"]
        for key in required:
            if key not in data or str(data[key]).strip() == "":
                return jsonify({"error": f"Falta ingresar el valor {key}."}), 400
            float(data[key])
        return jsonify(solve_system(data))
    except (ValueError, TypeError):
        return jsonify({"error": "Ingresa solamente números válidos en todos los campos."}), 400
    except Exception:
        return jsonify({"error": "No se pudo resolver el sistema. Revisa los valores ingresados."}), 400

if __name__ == "__main__":
    app.run(debug=True)
