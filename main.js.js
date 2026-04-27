import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/DragControls.js';

// 1. පූර්ණ මූලද්‍රව්‍ය දත්ත (1-20)
const elementData = {
    1: { name: "Hydrogen (H)", melt: "-259.1 °C", boil: "-252.9 °C", config: "1", charge: "+1, -1", mass: 1 },
    2: { name: "Helium (He)", melt: "-272.2 °C", boil: "-268.9 °C", config: "2", charge: "0", mass: 4 },
    3: { name: "Lithium (Li)", melt: "180.5 °C", boil: "1342 °C", config: "2, 1", charge: "+1", mass: 7 },
    4: { name: "Beryllium (Be)", melt: "1287 °C", boil: "2471 °C", config: "2, 2", charge: "+2", mass: 9 },
    5: { name: "Boron (B)", melt: "2076 °C", boil: "3927 °C", config: "2, 3", charge: "+3", mass: 11 },
    6: { name: "Carbon (C)", melt: "3550 °C", boil: "4827 °C", config: "2, 4", charge: "+4, -4", mass: 12 },
    7: { name: "Nitrogen (N)", melt: "-210 °C", boil: "-195.8 °C", config: "2, 5", charge: "-3", mass: 14 },
    8: { name: "Oxygen (O)", melt: "-218.4 °C", boil: "-183.0 °C", config: "2, 6", charge: "-2", mass: 16 },
    9: { name: "Fluorine (F)", melt: "-219.7 °C", boil: "-188.1 °C", config: "2, 7", charge: "-1", mass: 19 },
    10: { name: "Neon (Ne)", melt: "-248.6 °C", boil: "-246.1 °C", config: "2, 8", charge: "0", mass: 20 },
    11: { name: "Sodium (Na)", melt: "97.72 °C", boil: "883 °C", config: "2, 8, 1", charge: "+1", mass: 23 },
    12: { name: "Magnesium (Mg)", melt: "650 °C", boil: "1090 °C", config: "2, 8, 2", charge: "+2", mass: 24 },
    13: { name: "Aluminium (Al)", melt: "660.3 °C", boil: "2470 °C", config: "2, 8, 3", charge: "+3", mass: 27 },
    14: { name: "Silicon (Si)", melt: "1414 °C", boil: "3265 °C", config: "2, 8, 4", charge: "+4, -4", mass: 28 },
    15: { name: "Phosphorus (P)", melt: "44.15 °C", boil: "280.5 °C", config: "2, 8, 5", charge: "-3, +5", mass: 31 },
    16: { name: "Sulfur (S)", melt: "115.2 °C", boil: "444.6 °C", config: "2, 8, 6", charge: "-2, +6", mass: 32 },
    17: { name: "Chlorine (Cl)", melt: "-101.5 °C", boil: "-34.0 °C", config: "2, 8, 7", charge: "-1", mass: 35 },
    18: { name: "Argon (Ar)", melt: "-189.3 °C", boil: "-185.8 °C", config: "2, 8, 8", charge: "0", mass: 40 },
    19: { name: "Potassium (K)", melt: "63.5 °C", boil: "759 °C", config: "2, 8, 8, 1", charge: "+1", mass: 39 },
    20: { name: "Calcium (Ca)", melt: "842 °C", boil: "1484 °C", config: "2, 8, 8, 2", charge: "+2", mass: 40 }
};

// 2. Scene සැකසුම
const scene = new THREE.Scene();
const loader = new THREE.TextureLoader();
loader.load('https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?auto=format&fit=crop&w=1920&q=80', (t) => scene.background = t);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const atoms = [];
const bonds = [];

// 3. පරමාණුවක් සෑදීමේ ශ්‍රිතය
function createDetailedAtom(num) {
    const data = elementData[num] || { name: "Unknown", mass: num*2, config: "1" };
    const group = new THREE.Group();
    group.userData = { atomicNumber: num, data: data };

    // න්‍යෂ්ටිය
    const protons = num;
    const neutrons = data.mass - num;
    for (let i = 0; i < (protons + neutrons); i++) {
        const p = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), new THREE.MeshBasicMaterial({ color: i < protons ? 0xff0000 : 0x888888 }));
        p.position.set((Math.random()-0.5)*2.8, (Math.random()-0.5)*2.8, (Math.random()-0.5)*2.8);
        group.add(p);
    }

    // Phase Offset මඟින් ඉලෙක්ට්‍රෝන පෑහීම වළක්වමු
    const randomOffset = Math.random() * Math.PI * 2; 
    const shells = data.config.split(',').map(Number);
    
    shells.forEach((count, idx) => {
        const radius = (idx + 1) * 9;
        const isValence = (idx === shells.length - 1);
        
        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(radius, 0.05, 16, 100), 
            new THREE.MeshBasicMaterial({ color: isValence ? 0xffff00 : 0x444444, transparent: true, opacity: 0.5 })
        );
        orbit.rotation.x = Math.PI / 2;
        group.add(orbit);

        for (let i = 0; i < count; i++) {
            const pivot = new THREE.Group();
            const electron = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshBasicMaterial({ color: isValence ? 0xffff00 : 0x00ffff }));
            
            const angle = ((i / count) * Math.PI * 2) + randomOffset; 
            electron.position.set(Math.cos(angle)*radius, 0, Math.sin(angle)*radius);
            
            pivot.add(electron);
            pivot.userData = { speed: 0.02 / (idx + 1) };
            group.add(pivot);
        }
    });

    group.position.set((Math.random()-0.5)*25, 0, (Math.random()-0.5)*25);
    scene.add(group);
    atoms.push(group);
    updateUI(data, num);
}

function updateUI(data, num) {
    document.getElementById('elem-name').innerText = data.name;
    document.getElementById('info-protons').innerText = num;
    document.getElementById('info-neutrons').innerText = data.mass - num;
    document.getElementById('info-electrons').innerText = num;
    document.getElementById('info-config').innerText = data.config;
    document.getElementById('info-melt').innerText = data.melt;
    document.getElementById('info-boil').innerText = data.boil;
    document.getElementById('info-charge').innerText = data.charge;
}

// 4. Drag Controls (අතින් ඇදගෙන යාම)
const dragControls = new DragControls(atoms, camera, renderer.domElement);
dragControls.addEventListener('dragstart', (e) => {
    controls.enabled = false;
    updateUI(e.object.userData.data, e.object.userData.atomicNumber);
});
dragControls.addEventListener('dragend', () => controls.enabled = true);

// 5. බන්ධන සහ පරමාණු හැරවීම (LookAt Logic)
function updateBonds() {
    bonds.forEach(b => scene.remove(b));
    bonds.length = 0;
    if(window.simMode !== 'molecule') return;

    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const dist = atoms[i].position.distanceTo(atoms[j].position);
            if (dist < 22) {
                // පරමාණු එකිනෙකා දෙසට හරවා කක්ෂික පෑහීම පෙන්වීම
                atoms[i].lookAt(atoms[j].position);
                atoms[j].lookAt(atoms[i].position);

                const geometry = new THREE.BufferGeometry().setFromPoints([atoms[i].position, atoms[j].position]);
                const line = new THREE.Line(geometry, new THREE.MeshBasicMaterial({ color: 0x00ff00, linewidth: 2 }));
                scene.add(line);
                bonds.push(line);
            }
        }
    }
}

// 6. UI සිදුවීම්
document.getElementById('main-action-btn').addEventListener('click', () => {
    const num = parseInt(document.getElementById('atomic-input').value);
    if(window.simMode === 'atom') {
        atoms.forEach(a => scene.remove(a));
        atoms.length = 0;
    }
    createDetailedAtom(num);
});

document.getElementById('clear-btn').addEventListener('click', () => {
    atoms.forEach(a => scene.remove(a));
    atoms.length = 0;
});

window.clearAllAtoms = () => {
    atoms.forEach(a => scene.remove(a));
    atoms.length = 0;
};

// 7. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    updateBonds();
    
    // ඉලෙක්ට්‍රෝන කරකැවීම
    atoms.forEach(atom => {
        atom.children.forEach(child => {
            if(child.userData && child.userData.speed) {
                child.rotation.y += child.userData.speed;
            }
        });
    });
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
// --- රසායනික ගණනය කිරීම් (Calculator Logic) ---

// මවුල ගණන ගණනය කිරීමේ ශ්‍රිතය
window.calculateMoles = function() {
    const mass = parseFloat(document.getElementById('calc-mass').value);
    const molarMass = parseFloat(document.getElementById('calc-molar-mass').value);
    
    if (mass && molarMass) {
        const moles = mass / molarMass;
        document.getElementById('moles-result').innerText = `පිළිතුර: මවුල ${moles.toFixed(4)}`;
    } else {
        alert("කරුණාකර නිවැරදි අගයන් ඇතුළත් කරන්න.");
    }
}

// භෞතික නියතයන් (Constants)
const CONSTANTS = {
    Na: 6.022e23,
    R: 8.314,
    c: 3.0e8,
    h: 6.626e-34 
};
// --- pH සහ pOH ගණනය කිරීමේ ශ්‍රිතය ---
window.calculatePH = function() {
    const type = document.getElementById('ion-type').value; // H ද OH ද කියා බැලීම
    const val = parseFloat(document.getElementById('h-val').value);
    const pow = parseFloat(document.getElementById('h-pow').value);
    
    if (!isNaN(val) && !isNaN(pow)) {
        const conc = val * Math.pow(10, pow);
        const pValue = -Math.log10(conc); // මෙය pH හෝ pOH විය හැක
        
        let ph, poh;

        // OH- සාන්ද්‍රණය දුන්නොත් pH = 14 - pOH සූත්‍රය භාවිතා වේ
        if (type === 'H') {
            ph = pValue;
            poh = 14 - ph;
        } else {
            poh = pValue;
            ph = 14 - poh;
        }

        // ප්‍රතිඵල UI එකට ලබා දීම
        const resultDiv = document.getElementById('ph-result');
        resultDiv.innerText = `pH අගය: ${ph.toFixed(2)}`;
        document.getElementById('poh-result').innerText = `pOH අගය: ${poh.toFixed(2)}`;
        
        // pH අගය අනුව වර්ණය වෙනස් කිරීම (ආම්ලික/භාෂ්මික)
        if(ph < 7.0) {
            resultDiv.style.color = "#ff4d4d"; // Acidic - Red
        } else if(ph > 7.0) {
            resultDiv.style.color = "#4d79ff"; // Basic - Blue
        } else {
            resultDiv.style.color = "#2ecc71"; // Neutral - Green
        }
    } else {
        alert("කරුණාකර අගයන් (Value & Power) නිවැරදිව ඇතුළත් කරන්න.");
    }
}
// සමීකරණය අනුව Fields පෙන්වීම/සැඟවීම
window.toggleEqnFields = function() {
    const selected = document.getElementById('eqn-selector').value;
    document.querySelectorAll('.eqn-input-group').forEach(group => group.style.display = 'none');
    document.getElementById(selected + '-fields').style.display = 'block';
    document.getElementById('calc-ans').innerText = "පිළිතුර: -";
}

// සියලුම ගණනය කිරීම් පාලනය කරන Master Function එක
window.masterCalculate = function() {
    const eqn = document.getElementById('eqn-selector').value;
    let ans = "";

    if (eqn === 'moles') {
        const m = parseFloat(document.getElementById('m-mass').value);
        const M = parseFloat(document.getElementById('m-molar').value);
        ans = (m / M).toFixed(4) + " mol";
    } 
    else if (eqn === 'conc') {
        const n = parseFloat(document.getElementById('c-moles').value);
        const V = parseFloat(document.getElementById('c-vol').value);
        ans = (n / V).toFixed(4) + " mol dm⁻³";
    } 
    else if (eqn === 'gas') {
        const P = parseFloat(document.getElementById('g-p').value);
        const n = parseFloat(document.getElementById('g-n').value);
        const T = parseFloat(document.getElementById('g-t').value) + 273.15;
        ans = ((n * 0.0821 * T) / P).toFixed(3) + " dm³";
    }
    else if (eqn === 'energy') {
        const m = parseFloat(document.getElementById('e-m').value);
        const c = parseFloat(document.getElementById('e-c').value);
        const dt = parseFloat(document.getElementById('e-dt').value);
        ans = (m * c * dt).toFixed(2) + " J";
    }

    document.getElementById('calc-ans').innerText = "පිළිතුර: " + ans;
}
// --- Physics Data & Logic (Mechanics Section) ---

const physicsData = {
    mechanics: {
        name: "යාන්ත්‍ර විද්‍යාව",
        equations: {
            v_u_at: {
                name: "v = u + at",
                theory: "<b>චලිත සමීකරණය:</b> ඒකාකාර ත්වරණයෙන් චලනය වන වස්තුවක කාලය (t) සමඟ ප්‍රවේගයේ වෙනස මෙයින් දැක්වේ.",
                inputs: ["u (ms⁻¹)", "a (ms⁻²)", "t (s)"],
                calc: (vals) => vals["u (ms⁻¹)"] + (vals["a (ms⁻²)"] * vals["t (s)"])
            },
            s_ut_half_at2: {
                name: "s = ut + ½at²",
                theory: "<b>විස්ථාපනය සෙවීම:</b> ආරම්භක ප්‍රවේගය (u), කාලය (t) සහ ත්වරණය (a) දන්නා විට විස්ථාපනය (s) ගණනය කරයි.",
                inputs: ["u (ms⁻¹)", "t (s)", "a (ms⁻²)"],
                calc: (vals) => (vals["u (ms⁻¹)"] * vals["t (s)"]) + (0.5 * vals["a (ms⁻²)"] * Math.pow(vals["t (s)"], 2))
            },
            v2_u2_2as: {
                name: "v² = u² + 2as",
                theory: "<b>ප්‍රවේගය සහ විස්ථාපනය:</b> කාලය (t) නොදන්නා අවස්ථාවලදී චලිතය ගණනය කිරීමට භාවිතා කරයි.",
                inputs: ["u (ms⁻¹)", "a (ms⁻²)", "s (m)"],
                calc: (vals) => Math.sqrt(Math.pow(vals["u (ms⁻¹)"], 2) + (2 * vals["a (ms⁻²)"] * vals["s (m)"]))
            },
            work_done: {
                name: "W = Fs cosθ",
                theory: "<b>කාර්යය:</b> වස්තුවක් මත බලයක් (F) යොදා එය විස්ථාපනයක් (s) සිදු කළ විට කළ කාර්යය ගණනය කරයි. θ යනු බලය සහ විස්ථාපනය අතර කෝණයයි.",
                inputs: ["F (N)", "s (m)", "θ (deg)"],
                calc: (vals) => vals["F (N)"] * vals["s (m)"] * Math.cos(vals["θ (deg)"] * Math.PI / 180)
            },
            kinetic_energy: {
                name: "Ek = ½mv²",
                theory: "<b>චාලක ශක්තිය:</b> චලනය වන වස්තුවක් සතු ශක්තිය එහි ස්කන්ධය (m) සහ ප්‍රවේගය (v) මත රඳා පවතී.",
                inputs: ["m (kg)", "v (ms⁻¹)"],
                calc: (vals) => 0.5 * vals["m (kg)"] * Math.pow(vals["v (ms⁻¹)"], 2)
            },
            potential_energy: {
                name: "Ep = mgh",
                theory: "<b>ගුරුත්වාකර්ෂණ විභව ශක්තිය:</b> වස්තුවක් පොළොවේ සිට යම් උසක (h) තැබූ විට එහි ගබඩා වන ශක්තියයි. g = 9.81 ms⁻² ලෙස ගනු ලැබේ.",
                inputs: ["m (kg)", "h (m)"],
                calc: (vals) => vals["m (kg)"] * 9.81 * vals["h (m)"]
            },
            power: {
                name: "P = W / t",
                theory: "<b>බලය (Power):</b> කාර්යය කිරීමේ සීඝ්‍රතාවය බලය ලෙස හැඳින්වේ. ඒකකය වොට් (W) වේ.",
                inputs: ["W (J)", "t (s)"],
                calc: (vals) => vals["W (J)"] / vals["t (s)"]
            },
            centripetal_force: {
                name: "F = mv²/r",
                theory: "<b>කේන්ද්‍රාභිසාරී බලය:</b> වෘත්තාකාර පථයක වස්තුවක් රඳවා තබා ගැනීමට අවශ්‍ය වන බලයයි. r යනු පථයේ අරයයි.",
                inputs: ["m (kg)", "v (ms⁻¹)", "r (m)"],
                calc: (vals) => (vals["m (kg)"] * Math.pow(vals["v (ms⁻¹)"], 2)) / vals["r (m)"]
            }
        }
    }
};

// UI Functions
window.updatePhysEquations = function() {
    const unit = document.getElementById('phys-unit').value;
    const eqnSelect = document.getElementById('phys-eqn');
    eqnSelect.innerHTML = '<option value="">-- සමීකරණය තෝරන්න --</option>';
    
    if (physicsData[unit]) {
        for (let key in physicsData[unit].equations) {
            let opt = document.createElement('option');
            opt.value = key;
            opt.innerHTML = physicsData[unit].equations[key].name;
            eqnSelect.appendChild(opt);
        }
    }
};

window.showPhysTheoryAndFields = function() {
    const unit = document.getElementById('phys-unit').value;
    const eqnKey = document.getElementById('phys-eqn').value;
    const theoryDiv = document.getElementById('phys-theory');
    const inputDiv = document.getElementById('phys-inputs');
    
    if (unit && eqnKey) {
        const eqn = physicsData[unit].equations[eqnKey];
        theoryDiv.innerHTML = eqn.theory;
        theoryDiv.style.display = 'block';
        
        inputDiv.innerHTML = "";
        eqn.inputs.forEach(inputLabel => {
            inputDiv.innerHTML += `
                <div style="margin-bottom:10px;">
                    <label style="font-size:0.75rem; color:#aaa;">${inputLabel}</label>
                    <input type="number" id="p-in-${inputLabel}" placeholder="අගය ඇතුළත් කරන්න" style="width:90%; padding:10px; background:#222; border:1px solid #444; color:white; border-radius:5px;">
                </div>`;
        });
    }
};

window.calculatePhysics = function() {
    const unit = document.getElementById('phys-unit').value;
    const eqnKey = document.getElementById('phys-eqn').value;
    if (!unit || !eqnKey) return;

    const eqn = physicsData[unit].equations[eqnKey];
    let vals = {};
    eqn.inputs.forEach(inputLabel => {
        vals[inputLabel] = parseFloat(document.getElementById(`p-in-${inputLabel}`).value);
    });

    const result = eqn.calc(vals);
    document.getElementById('phys-ans').innerText = "පිළිතුර: " + result.toFixed(2);
};
// ==========================================
// 8. අලුත් ආලෝකය සිමියුලේටරය (Optics Simulator)
// ==========================================

let optScene, optCamera, optRenderer, optMan, optImg, optLens;
let optRays = [];

// පේජ් මාරු කිරීමේ ශ්‍රිතය (මෙය ඔයාගේ පරණ showPage එකට අමුණන්න)
window.showOpticsPage = function() {
    document.querySelectorAll('.full-screen').forEach(p => p.style.display = 'none');
    const target = document.getElementById('optics-sim-page');
    if (target) {
        target.style.display = 'flex';
        if (!optRenderer) {
            initOpticsSim();
        }
        updateOpticsSim();
    }
};

function initOpticsSim() {
    const container = document.getElementById('optics-sim-page');
    if (!container) return;

    optScene = new THREE.Scene();
    optCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    optRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    optRenderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(optRenderer.domElement);

    // Grid සහ Lights
    const grid = new THREE.GridHelper(400, 40, 0x444444, 0x222222);
    grid.rotation.x = Math.PI / 2;
    optScene.add(grid);
    optScene.add(new THREE.AmbientLight(0x606060), new THREE.PointLight(0xffffff, 1, 500));

    // මිනිස් රූපය මවන හැටි (ඔයා ඉල්ලපු අත් වැසුම් සහිතව)
    function buildMan(isGhost) {
        const g = new THREE.Group();
        const bodyMat = new THREE.MeshPhongMaterial({color: isGhost ? 0x777777 : 0x00ff88, transparent: isGhost, opacity: isGhost ? 0.6 : 1});
        g.add(new THREE.Mesh(new THREE.BoxGeometry(4, 12, 2), bodyMat));
        
        const head = new THREE.Mesh(new THREE.SphereGeometry(3, 16, 16), new THREE.MeshPhongMaterial({color: 0xffdbac}));
        head.position.y = 9; g.add(head);
        
        const rHand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 1.5), new THREE.MeshPhongMaterial({color: 0xff0000})); // Red Glove
        rHand.position.set(3, 2, 0); g.add(rHand);
        
        const lHand = new THREE.Mesh(new THREE.BoxGeometry(1.5, 8, 1.5), new THREE.MeshPhongMaterial({color: 0x0000ff})); // Blue Glove
        lHand.position.set(-3, 2, 0); g.add(lHand);
        return g;
    }

    optMan = buildMan(false); optImg = buildMan(true);
    optScene.add(optMan, optImg);

    // කාචය
    optLens = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 2, 32), new THREE.MeshPhongMaterial({color: 0x00aaff, transparent: true, opacity: 0.3}));
    optLens.rotation.z = Math.PI / 2;
    optScene.add(optLens);

    optCamera.position.set(0, 30, 150);
    renderOptics();
}

function renderOptics() {
    requestAnimationFrame(renderOptics);
    if (optRenderer) optRenderer.render(optScene, optCamera);
}

window.updateOpticsSim = function() {
    if (!optMan) return;
    const fVal = parseFloat(document.getElementById('l-f').value);
    const u = parseFloat(document.getElementById('l-u').value);
    const type = document.getElementById('l-type').value;

    let f = (type === 'convex') ? fVal : -fVal;
    let v = (f * u) / (u - f);
    let m = -(v / u);

    optMan.position.x = -u;
    optImg.position.x = v;
    optImg.scale.set(m, m, m);

    // ආලෝක කිරණ ඇඳීම
    optRays.forEach(r => optScene.remove(r));
    optRays = [];
    const rayMat = new THREE.LineBasicMaterial({color: 0xffff00});
    const h = 9; // Height to head

    const points1 = [new THREE.Vector3(-u, h, 0), new THREE.Vector3(0, h, 0), new THREE.Vector3(v, -h*(v/u), 0)];
    const line1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points1), rayMat);
    
    const points2 = [new THREE.Vector3(-u, h, 0), new THREE.Vector3(v, -h*(v/u), 0)];
    const line2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points2), rayMat);

    optScene.add(line1, line2);
    optRays.push(line1, line2);

    document.getElementById('f-val-display').innerText = fVal;
    document.getElementById('u-val-display').innerText = u;
};