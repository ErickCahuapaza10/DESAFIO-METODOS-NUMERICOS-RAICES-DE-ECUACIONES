document.addEventListener('DOMContentLoaded', () => {
    // ==========================
    // 1. FUNCIONES PREDEFINIDAS
    // ==========================
    const functions = {
        p1: {
            f: x => Math.pow(x, 3) - Math.exp(0.8 * x) - 20,
            f_prime: x => 3 * Math.pow(x, 2) - 0.8 * Math.exp(0.8 * x)
        },
        p2: {
            f: x => 3 * Math.sin(0.5 * x) - 0.5 * x + 2,
            f_prime: x => 1.5 * Math.cos(0.5 * x) - 0.5
        },
        p3: {
            f: x => Math.pow(x, 3) - Math.pow(x, 2) * Math.exp(-0.5 * x) - 3 * x + 1,
            f_prime: x => {
                // f(x) = x^3 - x^2 e^{-0.5x} - 3x + 1
                // f'(x) = 3x^2 - [2x e^{-0.5x} - 0.5x^2 e^{-0.5x}] - 3
                const eTerm = Math.exp(-0.5 * x);
                return 3 * x * x - (2 * x * eTerm - 0.5 * x * x * eTerm) - 3;
            }
        },
        p4: {
            f: x => Math.pow(Math.cos(x), 2) - 0.5 * x * Math.exp(0.3 * x) + 5,
            f_prime: x => {
                // f(x) = cos^2(x) - 0.5 x e^{0.3x} + 5
                // f'(x) = -2 cos(x) sin(x) - [0.5 e^{0.3x} + 0.15 x e^{0.3x}]
                const ex = Math.exp(0.3 * x);
                return -2 * Math.cos(x) * Math.sin(x) - 0.5 * ex - 0.15 * x * ex;
            }
        }
    };

    // ===============================
    // 2. HELPERS GENERALES / UTILES
    // ===============================
    function parseCustomFunction(str) {
        if (!str || typeof str !== 'string') return null;
        try {
            let jsStr = str.toLowerCase();

            // Reemplazo de potencias
            jsStr = jsStr.replace(/\^/g, '**');

            // Funciones trig y otras
            jsStr = jsStr.replace(/\b(sin)\b/g, 'Math.sin');
            jsStr = jsStr.replace(/\b(cos)\b/g, 'Math.cos');
            jsStr = jsStr.replace(/\b(tan)\b/g, 'Math.tan');
            jsStr = jsStr.replace(/\b(exp)\b/g, 'Math.exp');
            jsStr = jsStr.replace(/\blog\b/g, 'Math.log');
            jsStr = jsStr.replace(/\bsqrt\b/g, 'Math.sqrt');
            jsStr = jsStr.replace(/\bpi\b/g, 'Math.PI');
            jsStr = jsStr.replace(/\be\b/g, 'Math.E');

            // Evitar cosas peligrosas
            if (
                jsStr.includes('=') ||
                jsStr.includes('while') ||
                jsStr.includes('for') ||
                jsStr.includes('function')
            ) {
                return null;
            }

            // Crear función
            return new Function('x', 'return ' + jsStr);
        } catch (e) {
            return null;
        }
    }

    function numericalDerivative(f, x) {
        const h = 1e-5;
        return (f(x + h) - f(x - h)) / (2 * h);
    }

    // ==========================
    // 3. MÉTODOS NUMÉRICOS
    // ==========================
    function bisection(f, a, b, tol) {
        const iterations = [];
        const maxIter = 1000;
        let iter = 0;

        let fa = f(a);
        let fb = f(b);

        if (!isFinite(fa) || !isFinite(fb)) {
            return { error: 'f(a) o f(b) no es finito. Revisa el intervalo.' };
        }

        if (fa * fb >= 0) {
            return {
                error:
                    'Condición f(a)·f(b) < 0 no cumplida. El intervalo no encierra una raíz o hay múltiples raíces pares.'
            };
        }

        let c, fc, error;

        while (iter < maxIter) {
            c = (a + b) / 2;
            fc = f(c);
            fa = f(a);
            fb = f(b);

            if (!isFinite(fc)) {
                return { error: 'La función explota en el intervalo. Ajusta [a, b].' };
            }

            error = Math.abs((b - a) / 2);

            iterations.push({
                iter,
                a: a.toFixed(6),
                b: b.toFixed(6),
                'f(a)': fa.toFixed(6),
                'f(b)': fb.toFixed(6),
                c: c.toFixed(6),
                'f(c)': fc.toFixed(6),
                error: error.toFixed(6)
            });

            if (Math.abs(fc) < tol || error < tol) {
                return { root: c, iterations, iterationsCount: iterations.length };
            }

            if (fa * fc < 0) {
                b = c;
            } else {
                a = c;
            }
            iter++;
        }

        return { error: 'Máximo de iteraciones alcanzado.', iterations, iterationsCount: iterations.length };
    }

    function newtonRaphson(f, fPrime, x0, tol) {
        const iterations = [];
        const maxIter = 100;
        let iter = 0;
        let xn = x0;

        while (iter < maxIter) {
            const fxn = f(xn);
            const fpxn = fPrime(xn);

            if (!isFinite(fxn) || !isFinite(fpxn)) {
                return { error: 'La evaluación de f(x) o f\'(x) no es finita.', iterations };
            }

            if (Math.abs(fpxn) < 1e-12) {
                return { error: 'Derivada cercana a 0. El método falla.', iterations };
            }

            const xnNew = xn - fxn / fpxn;
            const error = Math.abs(xnNew - xn);

            iterations.push({
                iter,
                xn: xn.toFixed(8),
                'f(xn)': fxn.toFixed(8),
                "f'(xn)": fpxn.toFixed(8),
                'xn+1': xnNew.toFixed(8),
                error: error.toFixed(8)
            });

            if (error < tol) {
                return { root: xnNew, iterations, iterationsCount: iterations.length };
            }

            xn = xnNew;
            iter++;
        }

        return { error: 'Máximo de iteraciones alcanzado.', iterations, iterationsCount: iterations.length };
    }

    function secant(f, x0, x1, tol) {
        const iterations = [];
        const maxIter = 100;
        let iter = 0;

        while (iter < maxIter) {
            const fx0 = f(x0);
            const fx1 = f(x1);

            if (!isFinite(fx0) || !isFinite(fx1)) {
                return { error: 'La evaluación de f(x) no es finita. Revisa los puntos iniciales.', iterations };
            }

            const denominator = fx1 - fx0;

            if (Math.abs(denominator) < 1e-12) {
                return { error: 'División por cero en el método de la secante.', iterations };
            }

            const x2 = x1 - (fx1 * (x1 - x0)) / denominator;
            const error = Math.abs(x2 - x1);

            iterations.push({
                iter,
                x0: x0.toFixed(8),
                x1: x1.toFixed(8),
                'f(x0)': fx0.toFixed(8),
                'f(x1)': fx1.toFixed(8),
                x2: x2.toFixed(8),
                error: error.toFixed(8)
            });

            if (error < tol) {
                return { root: x2, iterations, iterationsCount: iterations.length };
            }

            x0 = x1;
            x1 = x2;
            iter++;
        }

        return { error: 'Máximo de iteraciones alcanzado.', iterations, iterationsCount: iterations.length };
    }

    // ===================================
    // 4. UI: TABS / NAVEGACIÓN DE SECCIONES
    // ===================================
    const navLinks = document.querySelectorAll('.nav-link');
    const problemas = document.querySelectorAll('.problema');

    navLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const targetId = link.getAttribute('href');

            navLinks.forEach(l => {
                l.classList.remove('active');
                l.setAttribute('aria-selected', 'false');
            });
            problemas.forEach(p => p.classList.remove('active'));

            link.classList.add('active');
            link.setAttribute('aria-selected', 'true');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            const topMain = document.querySelector('.app-main');
            if (topMain) {
                topMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ==========================
    // 5. UI: CREACIÓN DE TARJETAS
    // ==========================
    function createResultCard(methodName, result) {
        const card = document.createElement('div');
        card.className = 'result-card';

        let html = `<h3>${methodName}</h3>`;

        if (!result || result.error) {
            const msg = result && result.error ? result.error : 'No se pudo calcular el método.';
            html += `<div class="raiz error">Error: ${msg}</div>`;
        } else {
            html += `<div class="raiz">Raíz encontrada: ${result.root.toFixed(8)}</div>`;
            html += createTableHTML(result.iterations);
        }

        card.innerHTML = html;
        return card;
    }

    function createTableHTML(iterations) {
        if (!iterations || !iterations.length) return '';
        const headers = Object.keys(iterations[0]);

        let thead = '<thead><tr>';
        headers.forEach(h => {
            thead += `<th>${h}</th>`;
        });
        thead += '</tr></thead>';

        let tbody = '<tbody>';
        iterations.forEach(row => {
            tbody += '<tr>';
            headers.forEach(h => {
                tbody += `<td>${row[h]}</td>`;
            });
            tbody += '</tr>';
        });
        tbody += '</tbody>';

        return `<div class="table-container"><table>${thead}${tbody}</table></div>`;
    }

    // ==========================
    // 6. RESUMEN COMPARATIVO
    // ==========================
    function renderSummary(summaryId, summaryData) {
        const container = document.getElementById(summaryId);
        if (!container) return;

        const validMethods = summaryData.filter(item => item.result && !item.result.error);

        if (!validMethods.length) {
            container.innerHTML = `
                <div class="summary-header">
                    <div class="summary-title">Resumen comparativo</div>
                    <div class="summary-pill">Sin resultados válidos</div>
                </div>
                <p class="summary-main-root">
                    Ajusta la tolerancia o los valores iniciales / intervalo para obtener convergencia.
                </p>
            `;
            return;
        }

        const best = validMethods.reduce((bestSoFar, current) => {
            if (!bestSoFar) return current;
            const itBest = bestSoFar.result.iterationsCount || bestSoFar.result.iterations?.length || Infinity;
            const itCurrent = current.result.iterationsCount || current.result.iterations?.length || Infinity;
            return itCurrent < itBest ? current : bestSoFar;
        }, null);

        const bestIters = best.result.iterationsCount || best.result.iterations.length;
        const bestRoot = best.result.root;

        const chipsHTML = validMethods
            .map(item => {
                const iters = item.result.iterationsCount || item.result.iterations.length;
                const rootValue = item.result.root.toFixed(6);
                return `<span class="summary-chip"><span>${item.name}</span> · iter: ${iters} · raíz ≈ ${rootValue}</span>`;
            })
            .join('');

        container.innerHTML = `
            <div class="summary-header">
                <div class="summary-title">Resumen comparativo</div>
                <div class="summary-pill">Método más eficiente: ${best.name}</div>
            </div>
            <div class="summary-body">
                <div class="summary-main-root">
                    <p>La mejor convergencia se obtuvo con <strong>${best.name}</strong>, logrando una raíz aproximada:</p>
                    <p><strong>x ≈ ${bestRoot.toFixed(8)}</strong> en <strong>${bestIters}</strong> iteraciones.</p>
                </div>
                <div class="summary-methods">
                    ${chipsHTML}
                </div>
            </div>
        `;
    }

    // ==========================
    // 7. BOTONES PREDEFINIDOS (P1–P4)
    // ==========================
    const calcButtons = document.querySelectorAll('.btn-calcular');

    calcButtons.forEach(button => {
        button.addEventListener('click', () => {
            const probKey = button.getAttribute('data-problem');
            const funcs = functions[probKey];
            if (!funcs) return;

            const tolInput = document.getElementById(`${probKey}-tol`);
            const tol = parseFloat(tolInput.value) || 1e-5;

            const resultsContainer = document.getElementById(`${probKey}-results`);
            const summaryId = `${probKey}-summary`;
            const loader = button.parentElement.querySelector('.loader');

            if (resultsContainer) resultsContainer.innerHTML = '';
            if (loader) {
                loader.textContent = 'Calculando...';
                loader.classList.add('is-visible');
            }

            const bisA = parseFloat(document.getElementById(`${probKey}-bis-a`).value);
            const bisB = parseFloat(document.getElementById(`${probKey}-bis-b`).value);
            const newX0 = parseFloat(document.getElementById(`${probKey}-new-x0`).value);
            const secX0 = parseFloat(document.getElementById(`${probKey}-sec-x0`).value);
            const secX1 = parseFloat(document.getElementById(`${probKey}-sec-x1`).value);

            const summaryData = [];

            const bisResult = bisection(funcs.f, bisA, bisB, tol);
            resultsContainer.appendChild(createResultCard('Bisección', bisResult));
            summaryData.push({ name: 'Bisección', result: bisResult });

            const newResult = newtonRaphson(funcs.f, funcs.f_prime, newX0, tol);
            resultsContainer.appendChild(createResultCard('Newton-Raphson', newResult));
            summaryData.push({ name: 'Newton-Raphson', result: newResult });

            const secResult = secant(funcs.f, secX0, secX1, tol);
            resultsContainer.appendChild(createResultCard('Secante', secResult));
            summaryData.push({ name: 'Secante', result: secResult });

            renderSummary(summaryId, summaryData);

            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (loader) {
                loader.textContent = '';
                loader.classList.remove('is-visible');
            }
        });
    });

    // ==========================
    // 8. CALCULADORA PERSONALIZADA
    // ==========================
    const customButtons = document.querySelectorAll('.btn-calcular-custom');
    const customResultsContainer = document.getElementById('custom-results');
    const customLoader = document.getElementById('custom-loader');

    customButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (!customResultsContainer) return;

            const eqStr = document.getElementById('custom-eq').value.trim();
            const customF = parseCustomFunction(eqStr);
            customResultsContainer.innerHTML = '';

            if (customLoader) {
                customLoader.textContent = 'Calculando...';
                customLoader.classList.add('is-visible');
            }

            if (!customF) {
                customResultsContainer.innerHTML =
                    '<div class="result-card"><h3>Error</h3><div class="raiz error">Error de sintaxis en la ecuación. Revisa paréntesis y funciones permitidas.</div></div>';
                if (customLoader) {
                    customLoader.textContent = '';
                    customLoader.classList.remove('is-visible');
                }
                return;
            }

            try {
                const testVal = customF(1);
                if (!isFinite(testVal)) {
                    throw new Error('La función no es finita en x=1.');
                }
            } catch (e) {
                customResultsContainer.innerHTML =
                    '<div class="result-card"><h3>Error</h3><div class="raiz error">La ecuación no es válida o produce valores no finitos.</div></div>';
                if (customLoader) {
                    customLoader.textContent = '';
                    customLoader.classList.remove('is-visible');
                }
                return;
            }

            const methodType = button.getAttribute('data-method');
            const tol = parseFloat(document.getElementById('custom-tol').value) || 1e-5;
            let result;
            let title;

            if (methodType === 'bis') {
                const a = parseFloat(document.getElementById('custom-bis-a').value);
                const b = parseFloat(document.getElementById('custom-bis-b').value);
                title = 'Resultado Bisección (Personalizada)';
                result = bisection(customF, a, b, tol);
            } else if (methodType === 'new') {
                const x0 = parseFloat(document.getElementById('custom-new-x0').value);
                title = 'Resultado Newton-Raphson (Personalizada)';
                const customDeriv = x => numericalDerivative(customF, x);
                result = newtonRaphson(customF, customDeriv, x0, tol);
            } else if (methodType === 'sec') {
                const x0 = parseFloat(document.getElementById('custom-sec-x0').value);
                const x1 = parseFloat(document.getElementById('custom-sec-x1').value);
                title = 'Resultado Secante (Personalizada)';
                result = secant(customF, x0, x1, tol);
            }

            const card = createResultCard(title, result);
            customResultsContainer.appendChild(card);

            customResultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (customLoader) {
                customLoader.textContent = '';
                customLoader.classList.remove('is-visible');
            }
        });
    });
});
