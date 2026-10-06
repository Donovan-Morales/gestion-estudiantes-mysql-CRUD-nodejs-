const API_URL = '/api/estudiantes';

const form = document.getElementById('estudiante-form');
const carnetInput = document.getElementById('carnet');
const nombresInput = document.getElementById('nombres');
const apellidosInput = document.getElementById('apellidos');
const fechaNacInput = document.getElementById('fecha_nac');
const carreraInput = document.getElementById('carrera');
const correoInput = document.getElementById('correo');

const btnGuardar = document.getElementById('btn-guardar');
const btnCancelar = document.getElementById('btn-cancelar');
const tablaBody = document.getElementById('tabla-estudiantes');

const buscarInput = document.getElementById('buscar-carnet');
const btnBuscar = document.getElementById('btn-buscar');
const btnLimpiar = document.getElementById('btn-limpiar');

let editando = false;

// Cargar todos los estudiantes al iniciar
document.addEventListener('DOMContentLoaded', obtenerEstudiantes);

// 1. Obtener y listar estudiantes
async function obtenerEstudiantes() {
  try {
    const res = await fetch(API_URL);
    const estudiantes = await res.json();
    renderTabla(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
  }
}

// Renderizar la tabla HTML
function renderTabla(estudiantes) {
  tablaBody.innerHTML = '';
  if (estudiantes.length === 0) {
    tablaBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay registros</td></tr>';
    return;
  }

  estudiantes.forEach(est => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${est.Carnet}</td>
      <td>${est.Nombres || ''}</td>
      <td>${est.Apellidos || ''}</td>
      <td>${est.Fecha_nac || ''}</td>
      <td>${est.Carrera || ''}</td>
      <td>${est.Correo || ''}</td>
      <td>
        <button class="btn-warning" onclick="prepararEditar('${est.Carnet}', '${est.Nombres}', '${est.Apellidos}', '${est.Fecha_nac}', '${est.Carrera}', '${est.Correo}')">Editar</button>
        <button class="btn-danger" onclick="eliminarEstudiante('${est.Carnet}')">Eliminar</button>
      </td>
    `;
    tablaBody.appendChild(tr);
  });
}

// 2. Guardar o Actualizar Estudiante
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const estudiante = {
    Carnet: carnetInput.value,
    Nombres: nombresInput.value,
    Apellidos: apellidosInput.value,
    Fecha_nac: fechaNacInput.value,
    Carrera: carreraInput.value,
    Correo: correoInput.value
  };

  try {
    let res;
    if (editando) {
      res = await fetch(`${API_URL}/${estudiante.Carnet}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'json' },
        body: JSON.stringify(estudiante)
      });
    } else {
      res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estudiante)
      });
    }

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Ocurrió un error');
      return;
    }

    alert(data.message);
    resetFormulario();
    obtenerEstudiantes();
  } catch (error) {
    console.error('Error al guardar:', error);
  }
});

// Cargar datos en el formulario para editar
window.prepararEditar = (carnet, nombres, apellidos, fecha_nac, carrera, correo) => {
  editando = true;
  carnetInput.value = carnet;
  carnetInput.disabled = true; // No permitir cambiar el Carnet (Primary Key)
  nombresInput.value = nombres !== 'null' ? nombres : '';
  apellidosInput.value = apellidos !== 'null' ? apellidos : '';
  fechaNacInput.value = fecha_nac !== 'null' ? fecha_nac : '';
  carreraInput.value = carrera !== 'null' ? carrera : '';
  correoInput.value = correo !== 'null' ? correo : '';

  btnGuardar.textContent = 'Actualizar Estudiante';
  btnCancelar.style.display = 'inline-block';
};

// Cancelar edición
btnCancelar.addEventListener('click', resetFormulario);

function resetFormulario() {
  editando = false;
  form.reset();
  carnetInput.disabled = false;
  btnGuardar.textContent = 'Guardar Estudiante';
  btnCancelar.style.display = 'none';
}

// 3. Eliminar Estudiante
window.eliminarEstudiante = async (carnet) => {
  if (!confirm(`¿Estás seguro de eliminar el estudiante con Carnet ${carnet}?`)) return;

  try {
    const res = await fetch(`${API_URL}/${carnet}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message);
    obtenerEstudiantes();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

// 4. Buscar por Carnet
btnBuscar.addEventListener('click', async () => {
  const carnet = buscarInput.value.trim();
  if (!carnet) return obtenerEstudiantes();

  try {
    const res = await fetch(`${API_URL}/${carnet}`);
    if (res.status === 404) {
      alert('Estudiante no encontrado');
      return;
    }
    const estudiante = await res.json();
    renderTabla([estudiante]);
  } catch (error) {
    console.error('Error al buscar:', error);
  }
});

btnLimpiar.addEventListener('click', () => {
  buscarInput.value = '';
  obtenerEstudiantes();
});