// Importar Firebase desde su CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc, setDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"; // Asegúrate de que setDoc está aquí

// Configuración para la primera app de Firebase (copia1)
const firebaseConfig1 = {
    apiKey: "AIzaSyA4UiIT-3VtwBQagmFbyPZXD7C20YvXJd8",
    authDomain: "copia1-99d75.firebaseapp.com",
    projectId: "copia1-99d75",
    storageBucket: "copia1-99d75.appspot.com",
    messagingSenderId: "987795976067",
    appId: "1:987795976067:web:d5594d7b04907c919f90b6",
    measurementId: "G-8DHGMXK2MF"
};

// Configuración para la segunda app de Firebase (copia2)
const firebaseConfig2 = {
    apiKey: "AIzaSyCXvg75EhBp9A8iXPVniYh2mDuxOVKKuaw",
    authDomain: "copia2-f3987.firebaseapp.com",
    projectId: "copia2-f3987",
    storageBucket: "copia2-f3987.appspot.com",
    messagingSenderId: "770034827688",
    appId: "1:770034827688:web:f9eed40a075d7d2a351d9d",
    measurementId: "G-FCN574T8JP"
};

// Inicializar ambas apps
const app1 = initializeApp(firebaseConfig1, "app1");
const app2 = initializeApp(firebaseConfig2, "app2");

// Inicializar Firestore para ambas apps
const db1 = getFirestore(app1); // Base de datos 1
const db2 = getFirestore(app2); // Base de datos 2

// Referencia a las colecciones de historias clínicas en ambas bases de datos
const historiasClinicasRef1 = collection(db1, 'historias_clinicas');
const historiasClinicasRef2 = collection(db2, 'historias_clinicas');

const getCurrentTimestamp = () => {
    return new Date(); // Devuelve la fecha y hora actual
};

// Asegúrate de que la función renderHistoriasClinicas esté definida correctamente
const renderHistoriasClinicas = (querySnapshot, historiaList, mobileHistoriaList) => {
    querySnapshot.forEach((doc) => {
        const historia = doc.data();
        const row = `
            <tr>
                <td>${historia.nombre_paciente}</td>
                <td>${historia.dni}</td>
                <td>${historia.fecha_nacimiento}</td>
                <td>${historia.diagnostico}</td>
                <td>${historia.tratamiento}</td>
                <td>${historia.medico}</td>
                <td>${historia.fecha_consulta}</td>
                <td class="actions">
                    <button class="edit" onclick="editHistoriaClinica('${doc.id}', true)">Editar</button>
                    <button class="delete" onclick="deleteHistoriaClinica('${doc.id}', true)">Eliminar</button>
                </td>
            </tr>`;

        const mobileRow = `
            <tr>
                <td>${historia.nombre_paciente}</td>
                <td>${historia.diagnostico}</td>
                <td>${historia.tratamiento}</td>
                <td class="actions">
                    <button class="edit" onclick="editHistoriaClinica('${doc.id}', true)">Editar</button>
                    <button class="delete" onclick="deleteHistoriaClinica('${doc.id}', true)">Eliminar</button>
                </td>
            </tr>`;

        // Añadir fila solo a la tabla correspondiente en función del tamaño de pantalla
        if (window.innerWidth <= 768) {
            mobileHistoriaList.innerHTML += mobileRow; // Añadir a tabla móvil
        } else {
            historiaList.innerHTML += row; // Añadir a tabla de escritorio
        }
    });
};


// Cerrar el modal cuando se hace clic en la "X"
document.getElementById("close-modal").onclick = function () {
    document.getElementById("edit-modal").style.display = "none";
};

// También puedes cerrar el modal cuando el usuario hace clic fuera de la ventana modal
window.onclick = function (event) {
    const modal = document.getElementById("edit-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

// Función para agregar una nueva historia clínica en ambas bases de datos, pero usar db2 si hay error en db1
const addHistoriaClinica = async () => {
    const nombre = document.getElementById("nombre").value;
    const dni = document.getElementById("dni").value;
    const fechaNacimiento = document.getElementById("fecha_nacimiento").value;
    const diagnostico = document.getElementById("diagnostico").value;
    const tratamiento = document.getElementById("tratamiento").value;
    const medico = document.getElementById("medico").value;
    const fechaConsulta = document.getElementById("fecha_consulta").value;
    const timestamp = getCurrentTimestamp();

    try {
        // Intentar registrar en la primera base de datos y obtener el ID del documento creado
        const docRef1 = await addDoc(historiasClinicasRef1, {
            nombre_paciente: nombre,
            dni: dni,
            fecha_nacimiento: fechaNacimiento,
            diagnostico: diagnostico,
            tratamiento: tratamiento,
            medico: medico,
            fecha_consulta: fechaConsulta,
            fecha_creacion: timestamp
        });

        const docId = docRef1.id; // Obtener el ID del documento creado en db1

        // Registrar en la segunda base de datos usando el mismo ID
        await setDoc(doc(historiasClinicasRef2, docId), {
            nombre_paciente: nombre,
            dni: dni,
            fecha_nacimiento: fechaNacimiento,
            diagnostico: diagnostico,
            tratamiento: tratamiento,
            medico: medico,
            fecha_consulta: fechaConsulta,
            fecha_creacion: timestamp,
            historial_cambios: [{ evento: 'creacion', fecha: timestamp }]
        });

        alert("Historia clínica registrada exitosamente en ambas bases de datos.");
    } catch (e) {
        console.error("Error al agregar historia clínica en la base de datos 1: ", e);

        if (e.code === 'permission-denied') {
            // Si hay un problema de permisos, intentar registrar solo en db2
            try {
                const docRef2 = await addDoc(historiasClinicasRef2, {
                    nombre_paciente: nombre,
                    dni: dni,
                    fecha_nacimiento: fechaNacimiento,
                    diagnostico: diagnostico,
                    tratamiento: tratamiento,
                    medico: medico,
                    fecha_consulta: fechaConsulta,
                    fecha_creacion: timestamp,
                    historial_cambios: [{ evento: 'creacion', fecha: timestamp }]
                });

                alert("Historia clínica registrada solo en la base de datos 2 debido a problemas de permisos en la base de datos 1.");
            } catch (errorDb2) {
                console.error("Error al agregar historia clínica en la base de datos 2: ", errorDb2);
                alert("Error al agregar historia clínica en ambas bases de datos.");
            }
        } else {
            alert("Error inesperado al agregar historia clínica en la base de datos 1.");
        }
    }

    // Finalmente, actualizar la lista
    loadHistoriasClinicas();
};


// Función para cargar las historias clínicas solo desde la base de datos 1, y si falla, desde la base de datos 2
const loadHistoriasClinicas = async () => {
    document.getElementById("loading").style.display = "block"; // Mostrar el indicador de carga

    // Obtener referencias a las listas donde se mostrarán los datos
    const historiaList = document.getElementById("historia-list");
    const mobileHistoriaList = document.getElementById("mobile-historia-list");
    
    // Limpiar las listas antes de cargar nuevos datos
    historiaList.innerHTML = ""; // Limpiar la lista de escritorio
    mobileHistoriaList.innerHTML = ""; // Limpiar la lista móvil

    try {
        // Intentar cargar los datos desde la base de datos 1
        let querySnapshot1 = await getDocs(historiasClinicasRef1);

        // Renderizar los datos de la base de datos n.º 1
        if (!querySnapshot1.empty) {
            renderHistoriasClinicas(querySnapshot1, historiaList, mobileHistoriaList);
        } else {
            console.log("No se encontraron datos en la base de datos n.º 1.");
            // Si no hay datos, podrías agregar un mensaje en las listas
            historiaList.innerHTML = "<tr><td colspan='8' class='no-data'>No hay datos que mostrar.</td></tr>";
            mobileHistoriaList.innerHTML = "<tr><td colspan='4' class='no-data'>No hay datos que mostrar.</td></tr>";
        }
    } catch (e) {
        console.error("Error al cargar los datos desde la base de datos 1: ", e);

        // En caso de error de permisos, intentar cargar desde la base de datos 2
        if (e.code === 'permission-denied') {
            try {
                let querySnapshot2 = await getDocs(historiasClinicasRef2);

                // Renderizar los datos de la base de datos n.º 2
                if (!querySnapshot2.empty) {
                    renderHistoriasClinicas(querySnapshot2, historiaList, mobileHistoriaList);
                } else {
                    console.log("No se encontraron datos en la base de datos n.º 2.");
                    // Mensaje si tampoco hay datos en la segunda base de datos
                    historiaList.innerHTML = "<tr><td colspan='8' class='no-data'>No hay datos que mostrar.</td></tr>";
                    mobileHistoriaList.innerHTML = "<tr><td colspan='4' class='no-data'>No hay datos que mostrar.</td></tr>";
                }
            } catch (errorDb2) {
                console.error("Error al cargar los datos desde la base de datos 2: ", errorDb2);
                alert("Error al cargar los datos desde ambas bases de datos.");
            }
        } else {
            alert("Error inesperado al cargar los datos desde la base de datos 1.");
        }
    } finally {
        document.getElementById("loading").style.display = "none"; // Ocultar el indicador de carga
    }
};
// Modificar editHistoriaClinica para recibir la base de datos correspondiente

// Función para cerrar el modal
const closeEditModal = () => {
    document.getElementById("edit-modal").style.display = "none";
};

window.editHistoriaClinica = async (id, isFromDB1) => {
    const db = isFromDB1 ? db1 : db2; // Selecciona la base de datos correcta
    const historiaDoc = doc(db, 'historias_clinicas', id);
    const historia = await getDoc(historiaDoc);
    const data = historia.data();

    // Asegurarse de que todos los elementos existen antes de modificarlos
    const editNombre = document.getElementById("edit-nombre");
    const editDni = document.getElementById("edit-dni");
    const editFechaNacimiento = document.getElementById("edit-fecha-nacimiento");
    const editDiagnostico = document.getElementById("edit-diagnostico");
    const editTratamiento = document.getElementById("edit-tratamiento");
    const editMedico = document.getElementById("edit-medico");
    const editFechaConsulta = document.getElementById("edit-fecha-consulta");

    if (editNombre && editDni && editFechaNacimiento && editDiagnostico && 
        editTratamiento && editMedico && editFechaConsulta) {
        // Rellenar el formulario de edición
        editNombre.value = data.nombre_paciente;
        editDni.value = data.dni;
        editFechaNacimiento.value = data.fecha_nacimiento;
        editDiagnostico.value = data.diagnostico;
        editTratamiento.value = data.tratamiento;
        editMedico.value = data.medico;
        editFechaConsulta.value = data.fecha_consulta;

        // Mostrar el modal de edición
        const editModal = document.getElementById("edit-modal");
        if (editModal) {
            editModal.style.display = "block";
        }

        // Manejar el envío del formulario de edición
        const editForm = document.getElementById("edit-form");
        if (editForm) {
            editForm.onsubmit = async (event) => {
                event.preventDefault(); // Prevenir el comportamiento predeterminado
                const timestamp = getCurrentTimestamp();

                // Actualizar la historia clínica en la base de datos correspondiente
                await updateDoc(historiaDoc, {
                    nombre_paciente: editNombre.value,
                    dni: editDni.value,
                    fecha_nacimiento: editFechaNacimiento.value,
                    diagnostico: editDiagnostico.value,
                    tratamiento: editTratamiento.value,
                    medico: editMedico.value,
                    fecha_consulta: editFechaConsulta.value
                });

                // Actualizar también el registro en la otra base de datos
                const otherDb = isFromDB1 ? db2 : db1; // Determinar la otra base de datos
                const historialDocRef = doc(otherDb, 'historias_clinicas', id);
                await updateDoc(historialDocRef, {
                    nombre_paciente: editNombre.value,
                    dni: editDni.value,
                    fecha_nacimiento: editFechaNacimiento.value,
                    diagnostico: editDiagnostico.value,
                    tratamiento: editTratamiento.value,
                    medico: editMedico.value,
                    fecha_consulta: editFechaConsulta.value,
                    historial_cambios: arrayUnion({ evento: 'edicion', fecha: timestamp })
                });

                alert("Historia clínica actualizada exitosamente.");
                if (editModal) {
                    editModal.style.display = "none"; // Ocultar el modal
                }
                loadHistoriasClinicas(); // Actualizar la lista
            };
        }
    } else {
        console.error("Algunos elementos del formulario de edición no se encontraron en el DOM.");
    }
};

// Función para eliminar una historia clínica
window.deleteHistoriaClinica = async (id, isFromDB1) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta historia clínica?")) {
        let db = isFromDB1 ? db1 : db2; // Selecciona la base de datos correcta

        try {
            const historiaDoc = doc(db, 'historias_clinicas', id);
            await deleteDoc(historiaDoc);

            // Registrar eliminación en la segunda base de datos
            const otherDb = isFromDB1 ? db2 : db1;
            const historiaDocInOtherDB = doc(otherDb, 'historias_clinicas', id);
            await deleteDoc(historiaDocInOtherDB);

            alert("Historia clínica eliminada exitosamente.");
            loadHistoriasClinicas(); // Actualizar la lista
        } catch (e) {
            console.error("Error al eliminar la historia clínica: ", e);

            if (e.code === 'permission-denied') {
                // Intentar eliminar en la segunda base de datos si falla en la primera
                db = db2;
                const historiaDoc = doc(db, 'historias_clinicas', id);
                await deleteDoc(historiaDoc);

                alert("Historia clínica eliminada desde la base de datos 2.");
                loadHistoriasClinicas(); // Actualizar la lista
            }
        }
    }
};

// Cerrar el modal cuando se hace clic en la "X"
document.getElementById("close-modal").onclick = closeEditModal;

// También puedes cerrar el modal cuando el usuario hace clic fuera de la ventana modal
window.onclick = function (event) {
    const modal = document.getElementById("edit-modal");
    if (event.target === modal) {
        closeEditModal();
    }
};

// Manejar el envío del formulario para agregar una nueva historia clínica
document.getElementById("historia-form").onsubmit = (event) => {
    event.preventDefault(); // Prevenir el comportamiento predeterminado
    addHistoriaClinica(); // Agregar nueva historia clínica
};

// Cargar las historias clínicas al inicio
loadHistoriasClinicas();

// Función para sincronizar datos entre las dos bases de datos
const syncHistoriasClinicas = async () => {
    try {
        // Obtener todos los documentos de la base de datos 1
        const querySnapshot1 = await getDocs(historiasClinicasRef1);
        const data1 = querySnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Obtener todos los documentos de la base de datos 2
        const querySnapshot2 = await getDocs(historiasClinicasRef2);
        const data2 = querySnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Comparar y actualizar
        for (const historia2 of data2) {
            // Buscar si existe en la base de datos 1
            const historia1 = data1.find(hist => hist.dni === historia2.dni); // O cualquier otro campo único

            if (!historia1) {
                // Si no existe en db1, puedes optar por añadirlo (opcional)
                await setDoc(doc(historiasClinicasRef1, historia2.id), historia2);
            } else {
                // Si existe en db1, comprobar si necesita actualización
                const needsUpdate = Object.keys(historia2).some(key =>
                    historia1[key] !== historia2[key] && key !== 'historial_cambios'
                );

                if (needsUpdate) {
                    // Actualizar solo los campos que aceptan la base de datos 1
                    const updatedData = {};
                    for (const key in historia2) {
                        if (key in historia1 && key !== 'historial_cambios') {
                            updatedData[key] = historia2[key];
                        }
                    }

                    // Actualizar en la base de datos 1
                    await updateDoc(doc(historiasClinicasRef1, historia1.id), updatedData);
                }
            }
        }

        alert("Sincronización completada.");
    } catch (error) {
        console.error("Error durante la sincronización: ", error);
        alert("Ocurrió un error durante la sincronización.");
    }
};

document.getElementById('sync-button').addEventListener('click', async () => {
    // Lógica para sincronizar los datos
    const syncStatus = document.getElementById('sync-status');

    // Muestra que la sincronización está en progreso
    syncStatus.textContent = 'Sincronizando...';

    try {
        // Aquí deberías agregar la lógica para verificar y sincronizar datos
        await syncHistoriasClinicas(); // Llama a tu función de sincronización

        syncStatus.textContent = 'Sincronización completada!';
    } catch (error) {
        syncStatus.textContent = 'Error al sincronizar: ' + error.message;
    }
});
