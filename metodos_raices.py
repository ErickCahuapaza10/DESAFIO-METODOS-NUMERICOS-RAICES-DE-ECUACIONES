import math
import numpy as np
import matplotlib.pyplot as plt

# ==========================
# 1. FUNCIONES DE CADA EJERCICIO
# ==========================

def f1(x):
    # Problema 1: x^3 - e^{0.8x} - 20 = 0
    return x**3 - math.exp(0.8 * x) - 20

def f1_prime(x):
    # f'(x) = 3x^2 - 0.8 e^{0.8x}
    return 3 * x**2 - 0.8 * math.exp(0.8 * x)


def f2(x):
    # Problema 2: 3 sin(0.5x) - 0.5x + 2 = 0
    return 3 * math.sin(0.5 * x) - 0.5 * x + 2

def f2_prime(x):
    # f'(x) = 1.5 cos(0.5x) - 0.5
    return 1.5 * math.cos(0.5 * x) - 0.5


def f3(x):
    # Problema 3: x^3 - x^2 e^{-0.5x} - 3x + 1 = 0
    return x**3 - x**2 * math.exp(-0.5 * x) - 3 * x + 1

def f3_prime(x):
    # f'(x) = 3x^2 - (2x e^{-0.5x} - 0.5 x^2 e^{-0.5x}) - 3
    e_term = math.exp(-0.5 * x)
    return 3 * x**2 - (2 * x * e_term - 0.5 * x**2 * e_term) - 3


def f4(x):
    # Problema 4: cos^2(x) - 0.5 x e^{0.3x} + 5 = 0
    return math.cos(x)**2 - 0.5 * x * math.exp(0.3 * x) + 5

def f4_prime(x):
    # f'(x) = -2 cos(x) sin(x) - 0.5 e^{0.3x} - 0.15 x e^{0.3x}
    ex = math.exp(0.3 * x)
    return -2 * math.cos(x) * math.sin(x) - 0.5 * ex - 0.15 * x * ex


# ==========================
# 2. MÉTODOS NUMÉRICOS
# ==========================

def bisection(f, a, b, tol=1e-6, max_iter=100):
    """
    Devuelve:
    - root: aproximación de la raíz
    - iters: lista de diccionarios con los datos de cada iteración
    """
    iters = []
    fa = f(a)
    fb = f(b)

    if fa * fb >= 0:
        return None, [{
            "iter": 0,
            "a": a,
            "b": b,
            "c": None,
            "f(c)": None,
            "error": None,
            "mensaje": "f(a)*f(b) >= 0, el intervalo no encierra una raíz"
        }]

    for k in range(1, max_iter + 1):
        c = (a + b) / 2
        fc = f(c)
        error = abs(b - a) / 2

        iters.append({
            "iter": k,
            "a": a,
            "b": b,
            "c": c,
            "f(c)": fc,
            "error": error
        })

        if abs(fc) < tol or error < tol:
            return c, iters

        if fa * fc < 0:
            b = c
            fb = fc
        else:
            a = c
            fa = fc

    # Si llega aquí, no convergió dentro de max_iter
    return c, iters


def newton(f, df, x0, tol=1e-6, max_iter=100):
    iters = []
    x = x0
    for k in range(1, max_iter + 1):
        fx = f(x)
        dfx = df(x)

        if abs(dfx) < 1e-14:
            iters.append({
                "iter": k,
                "x": x,
                "f(x)": fx,
                "error": None,
                "mensaje": "Derivada casi cero, el método falla"
            })
            return None, iters

        x_new = x - fx / dfx
        error = abs(x_new - x)

        iters.append({
            "iter": k,
            "x": x,
            "f(x)": fx,
            "error": error
        })

        if error < tol:
            return x_new, iters

        x = x_new

    return x, iters


def secant(f, x0, x1, tol=1e-6, max_iter=100):
    iters = []
    for k in range(1, max_iter + 1):
        fx0 = f(x0)
        fx1 = f(x1)
        denom = fx1 - fx0

        if abs(denom) < 1e-14:
            iters.append({
                "iter": k,
                "x0": x0,
                "x1": x1,
                "f(x0)": fx0,
                "f(x1)": fx1,
                "error": None,
                "mensaje": "División por cero en la secante"
            })
            return None, iters

        x2 = x1 - fx1 * (x1 - x0) / denom
        error = abs(x2 - x1)

        iters.append({
            "iter": k,
            "x0": x0,
            "x1": x1,
            "f(x0)": fx0,
            "f(x1)": fx1,
            "x2": x2,
            "error": error
        })

        if error < tol:
            return x2, iters

        x0, x1 = x1, x2

    return x2, iters


# ==========================
# 3. IMPRESIÓN TABULADA
# ==========================

def print_table_bisection(iters):
    print(f"{'k':>3} {'a':>12} {'b':>12} {'c':>12} {'f(c)':>14} {'error':>14}")
    for row in iters:
        print(f"{row['iter']:3d} {row['a']:12.6f} {row['b']:12.6f} {row['c']:12.6f} {row['f(c)']:14.6e} {row['error']:14.6e}")


def print_table_newton(iters):
    print(f"{'k':>3} {'x':>14} {'f(x)':>16} {'error':>14}")
    for row in iters:
        print(f"{row['iter']:3d} {row['x']:14.8f} {row['f(x)']:16.8e} {row['error']:14.6e}")


def print_table_secant(iters):
    print(f"{'k':>3} {'x0':>12} {'x1':>12} {'f(x0)':>14} {'f(x1)':>14} {'x2':>12} {'error':>14}")
    for row in iters:
        print(f"{row['iter']:3d} {row['x0']:12.6f} {row['x1']:12.6f} {row['f(x0)']:14.6e} {row['f(x1)']:14.6e} {row['x2']:12.6f} {row['error']:14.6e}")


# ==========================
# 4. COMPARACIÓN DE EFICIENCIA
# ==========================

def resumen_metodo(nombre, root, iters, f):
    if root is None:
        return {
            "metodo": nombre,
            "iteraciones": len(iters),
            "raiz": None,
            "f(raiz)": None,
            "error_aprox": None
        }
    k = len(iters)
    # Error aproximado: tomamos el último "error" registrado si existe
    ultimo = iters[-1]
    error_aprox = ultimo.get("error", None)
    return {
        "metodo": nombre,
        "iteraciones": k,
        "raiz": root,
        "f(raiz)": f(root),
        "error_aprox": error_aprox
    }


def imprimir_resumen(resumenes):
    print("\n=== COMPARACIÓN DE MÉTODOS ===")
    print(f"{'Método':<15} {'Iter':>5} {'Raíz aprox':>14} {'f(raíz)':>14} {'Error aprox':>14}")
    for r in resumenes:
        raiz = f"{r['raiz']:.8f}" if r['raiz'] is not None else "----"
        fval = f"{r['f(raiz)']:.3e}" if r['f(raiz)'] is not None else "----"
        err  = f"{r['error_aprox']:.3e}" if r['error_aprox'] is not None else "----"
        print(f"{r['metodo']:<15} {r['iteraciones']:5d} {raiz:>14} {fval:>14} {err:>14}")


# ==========================
# 5. GRÁFICO: FUNCIÓN + APROX. DE RAÍZ
# ==========================

def plot_func_y_iteraciones(f, interval, it_bis, it_new, it_sec, titulo):
    """
    Dibuja la función f(x) en 'interval' y marca los puntos de las iteraciones
    de cada método (Bisección, Newton, Secante).
    """
    a, b = interval
    xs = np.linspace(a, b, 400)
    ys = [f(x) for x in xs]

    plt.figure(figsize=(10, 6))
    plt.axhline(0, color="black", linewidth=1)   # eje x
    plt.plot(xs, ys, label="f(x)")

    # Puntos de Bisección (usar c)
    if it_bis is not None and len(it_bis) > 0:
        x_bis = [row["c"] for row in it_bis]
        y_bis = [f(x) for x in x_bis]
        plt.scatter(x_bis, y_bis, marker="o", label="Bisección (iteraciones)")

    # Puntos de Newton (usar x)
    if it_new is not None and len(it_new) > 0:
        x_new = [row["x"] for row in it_new]
        y_new = [f(x) for x in x_new]
        plt.scatter(x_new, y_new, marker="s", label="Newton (iteraciones)")

    # Puntos de Secante (usar x1 o x2)
    if it_sec is not None and len(it_sec) > 0:
        x_sec = [row["x1"] for row in it_sec]  # también podrías usar x2
        y_sec = [f(x) for x in x_sec]
        plt.scatter(x_sec, y_sec, marker="^", label="Secante (iteraciones)")

    plt.title(titulo)
    plt.xlabel("x")
    plt.ylabel("f(x)")
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()


# ==========================
# 6. CORRER LOS 4 EJERCICIOS
# ==========================

def resolver_problema(
    nombre_problema,
    f, df,
    intervalo_bis, x0_newton, x0_sec, x1_sec,
    tol=1e-6
):
    print("\n" + "=" * 70)
    print(f"   {nombre_problema}")
    print("=" * 70)

    # --- BISECCIÓN ---
    print("\n--- Método de Bisección ---")
    root_bis, it_bis = bisection(f, intervalo_bis[0], intervalo_bis[1], tol=tol)
    print_table_bisection(it_bis)

    # --- NEWTON-RAPHSON ---
    print("\n--- Método de Newton-Raphson ---")
    root_new, it_new = newton(f, df, x0_newton, tol=tol)
    print_table_newton(it_new)

    # --- SECANTE ---
    print("\n--- Método de la Secante ---")
    root_sec, it_sec = secant(f, x0_sec, x1_sec, tol=tol)
    print_table_secant(it_sec)

    # --- RESUMEN EFICIENCIA ---
    resumenes = [
        resumen_metodo("Bisección", root_bis, it_bis, f),
        resumen_metodo("Newton", root_new, it_new, f),
        resumen_metodo("Secante", root_sec, it_sec, f),
    ]
    imprimir_resumen(resumenes)

    # --- GRÁFICO ---
    plot_func_y_iteraciones(
        f,
        intervalo_bis,
        it_bis,
        it_new,
        it_sec,
        titulo=f"Función y aproximaciones de raíz - {nombre_problema}"
    )


if __name__ == "__main__":
    # Parámetros de inicio

    # Problema 1: f1
    resolver_problema(
        "Problema 1: x^3 - e^{0.8x} - 20 = 0",
        f1, f1_prime,
        intervalo_bis=(0, 5),
        x0_newton=3.0,
        x0_sec=3.0,
        x1_sec=3.1,
        tol=0.0005
    )

    # Problema 2: f2
    resolver_problema(
        "Problema 2: 3 sin(0.5x) - 0.5x + 2 = 0",
        f2, f2_prime,
        intervalo_bis=(4, 6),
        x0_newton=5.0,
        x0_sec=4.8,
        x1_sec=5.0,
        tol=0.0005
    )

    # Problema 3: f3
    resolver_problema(
        "Problema 3: x^3 - x^2 e^{-0.5x} - 3x + 1 = 0",
        f3, f3_prime,
        intervalo_bis=(0, 1),
        x0_newton=0.5,
        x0_sec=0.4,
        x1_sec=0.5,
        tol=0.0005
    )

    # Problema 4: f4
    resolver_problema(
        "Problema 4: cos^2(x) - 0.5 x e^{0.3x} + 5 = 0",
        f4, f4_prime,
        intervalo_bis=(3, 4),   
        x0_newton=3.5,       
        x0_sec=3.0,
        x1_sec=4.0,
        tol=0.0005
    )
