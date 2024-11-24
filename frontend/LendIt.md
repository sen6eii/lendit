## LendIt - Diseño de la aplicación

- LendIt es una aplicación diseñada para mejorar la manera en que compartimos y gestionamos recursos dentro de comunidades o espacios de trabajo. Permite a los usuarios prestar, reservar y gestionar el uso de herramientas y objetos de manera eficiente, segura y transparente.

## Estructura Base de datos Mongo DB

- Colección Usuarios
  Contiene la información básica de cada usuario, incluyendo perfil, grupos y calificaciones.

{
"_id": "user123",
"nombre": "María González",
"email": "maria@gmail.com",
"telefono": "+59812345678",
"contraseña": "hashed_password",
"rol": "miembro",
"foto_perfil": "https://cdn.lendit.com/user123.jpg",
"grupos": ["grupo1", "grupo2"],
"calificaciones": {
"total_calificaciones": 10,
"promedio": 4.7,
"detalles": [
{ "puntaje": 5, "comentario": "Excelente prestatario", "autor": "user456", "fecha": "2024-10-01" },
{ "puntaje": 4, "comentario": "Devolvió en buen estado", "autor": "user789", "fecha": "2024-10-05" }
]
}
}


- Colección Grupos
Información sobre los grupos cerrados, tipo de comunidad y miembros asociados.

{
  "_id": "grupo1",
  "grupo_codigo": "ABCD1234",
  "fecha_creado": "2024-09-01",
  "id_miembro_owner": "user123",
  "grupo_privado": true,
  "nombre_grupo": "Barrio Nuevo Jardín",
  "foto_grupo": "https://cdn.lendit.com/grupo1.jpg",
  "tipo_comunidad": ["barrio cerrado"],
  "ubicacion": { "latitud": -34.90328, "longitud": -56.18816 },
  "miembros": ["user123", "user456"],
  "recursos": ["recurso1", "recurso2"]
}



- Colección Recursos
Cada recurso tiene una descripción y condiciones de uso en formato Delta JSON de Quill.js, además de otros datos como disponibilidad y calificaciones.

{
  "_id": "recurso1",
  "nombre_recurso": "Cortadora de Césped",
  "unidades": 1,
  "descripcion": {
    "ops": [
      { "insert": "Cortadora de Césped\n", "attributes": { "bold": true, "header": 1 } },
      { "insert": "Incluye bolsa recolectora. " },
      { "insert": "Ideal para jardines medianos.", "attributes": { "italic": true } }
    ]
  },
  "categoria": ["jardinería"],
  "propietario": "user123",
  "grupo": "grupo1",
  "fotos": ["https://cdn.lendit.com/recurso1_1.jpg", "https://cdn.lendit.com/recurso1_2.jpg"],
  "URLs_tutorial": ["https://www.youtube.com/tutorial"],
  "condiciones_uso": {
    "ops": [
      { "insert": "Usar solo en exteriores\n", "attributes": { "bold": true } },
      { "insert": "Devolver limpia y en buen estado." }
    ]
  },
  "dias_max": 5,
  "hora_inicio": "08:00",
  "hora_fin": "20:00",
  "dias": ["lunes", "martes", "viernes"],
  "punto_entrega": { "texto": "Recepción del edificio", "ubicacion": { "latitud": -34.90328, "longitud": -56.18816 } },
  "punto_devolucion": { "texto": "Patio trasero", "ubicacion": { "latitud": -34.90330, "longitud": -56.18818 } },
  "estado": "disponible",
  "calificaciones": {
    "total_calificaciones": 8,
    "promedio": 4.5,
    "detalles": [
      { "puntaje": 5, "comentario": "En excelente estado", "autor": "user123", "fecha": "2024-10-02" },
      { "puntaje": 3, "comentario": "Funcionaba, pero algo desgastado", "autor": "user456", "fecha": "2024-10-08" }
    ]
  }
}


- Colección Préstamos
Guarda la información de cada préstamo, incluyendo el recurso prestado, el prestatario y el estado del préstamo.

{
  "_id": "prestamo1",
  "recurso_id": "recurso1",
  "prestatario": "user456",
  "fecha_inicio": "2024-10-01",
  "fecha_fin": "2024-10-05",
  "estado": "finalizado"
}



## Consideraciones

Usuarios: Contiene perfil, grupos a los que pertenece, y calificaciones.
Grupos: Información del grupo, tipo de comunidad, ubicación, y lista de miembros y recursos.
Recursos: Detalles del recurso, disponibilidad, puntos de entrega/devolución, condiciones y calificaciones.
Préstamos: Información de cada préstamo, incluyendo el recurso, prestatario y estado.

otificaciones: Manejo en tiempo real con Socket.IO y push con OneSignal/FCM, sin almacenamiento en MongoDB.

Se almacena texto enriquecido en los campos de descripción y condiciones de uso gracias a Quill.js en formato Delta JSON.

## Conexión

npm install mongodb


mongodb+srv://user:user@cluster0.q9wec.mongodb.net/lendit?retryWrites=true&w=majority


## API

Tecnologías para la API
•	Node.js con Express.js: Para manejar las rutas y las peticiones.
•	MongoDB y Mongoose: Para conectar y manipular la base de datos.
•	JWT (JSON Web Token): Para autenticación y autorización segura.
•	Socket.io (opcional): Si deseas enviar notificaciones en tiempo real.


## Objetivos y responsabilidades de la API

- Autenticación y autorización:
Manejar el registro e inicio de sesión de usuarios.
Proteger las rutas mediante JSON Web Tokens (JWT) para asegurar que solo usuarios autenticados puedan acceder a las funciones.

- Gestión de usuarios y perfiles:
Permitir a los usuarios actualizar su perfil, consultar sus grupos y ver sus calificaciones.

- Gestión de grupos:
Crear y administrar grupos, agregar o quitar miembros, y listar los recursos disponibles en cada grupo.

- Gestión de recursos:
Permitir la creación, modificación, y eliminación de recursos (herramientas y objetos).
Proveer funcionalidad para ver detalles de cada recurso y calificaciones asociadas.

- Préstamos y reservas:
Gestionar el flujo de préstamo de recursos, permitiendo reservar y devolver recursos.
Implementar cambios de estado de préstamo (en curso, finalizado, retrasado).

- Notificaciones en tiempo real:
Utilizar Socket.IO para notificaciones en tiempo real sobre eventos importantes, como la aceptación de una solicitud de préstamo o recordatorios de devolución.

## Endpoints de la API
A continuación, se detallan los endpoints organizados por funcionalidad:

1. Autenticación
## POST /api/auth/register
Registra un nuevo usuario.
Datos requeridos: nombre, email, contraseña, teléfono.

## POST /api/auth/login
Inicia sesión y devuelve un token JWT.
Datos requeridos: email, contraseña.

## POST /api/auth/logout
Cierra sesión y elimina el token (si se usa almacenamiento en el cliente).

2. Usuarios
## GET /api/users/

Obtiene la información de un usuario específico, incluyendo calificaciones y grupos a los que pertenece.
Requiere autenticación.

## PATCH /api/users/

Actualiza la información de un usuario.
Requiere autenticación.
Datos opcionales: nombre, teléfono, foto_perfil.

3. Grupos
## POST /api/groups
Crea un nuevo grupo cerrado.
Requiere autenticación.
Datos requeridos: nombre_grupo, tipo_comunidad, ubicacion, grupo_privado.

## GET /api/groups/

Obtiene la información de un grupo específico, incluyendo lista de miembros y recursos disponibles.
Requiere autenticación.

## POST /api/groups/
/members
Añade un miembro a un grupo. Solo el administrador del grupo puede realizar esta acción.
Datos requeridos: ID del miembro.

## DELETE /api/groups/
/members/

Elimina un miembro de un grupo. Solo el administrador del grupo puede realizar esta acción.

4. Recursos
## POST /api/resources
Crea un nuevo recurso en un grupo.
Requiere autenticación.
Datos requeridos: nombre_recurso, descripcion (en formato Delta de Quill), categoria, grupo, fotos, condiciones_uso (en formato Delta de Quill), disponibilidad.

## GET /api/resources/

Obtiene los detalles de un recurso específico, incluyendo calificaciones.
Requiere autenticación.

## PATCH /api/resources/

Actualiza la información de un recurso.
Requiere autenticación y autorización (solo el propietario del recurso o el administrador del grupo).
Datos opcionales: descripcion, fotos, condiciones_uso, disponibilidad.

## DELETE /api/resources/

Elimina un recurso. Solo el propietario o el administrador del grupo puede hacerlo.
Requiere autenticación.

5. Préstamos
## POST /api/loans
Solicita un préstamo para un recurso.
Requiere autenticación.
Datos requeridos: recurso_id, fecha_inicio, fecha_fin.

## GET /api/loans/

Consulta los detalles de un préstamo específico, incluyendo estado actual y fechas.
Requiere autenticación.

## PATCH /api/loans/

Actualiza el estado del préstamo (ej., finalizado, en curso). Solo el prestatario o el administrador pueden hacerlo.
Datos requeridos: nuevo estado.

## GET /api/loans
Lista todos los préstamos activos y finalizados del usuario autenticado.
Para prestamos retrasados utilizar función cron.

6. Calificaciones
## POST /api/resources/
## /reviews
Agrega una calificación a un recurso.
Requiere autenticación.
Datos requeridos: puntaje, comentario.

## POST /api/users/
## /reviews
Agrega una calificación a un usuario (solo después de completar un préstamo).
Requiere autenticación.
Datos requeridos: puntaje, comentario.

7. Notificaciones
## GET /api/notifications
Lista las notificaciones más recientes del usuario autenticado (si decides almacenarlas en MongoDB).

Socket.IO (en tiempo real):

Evento: "new-loan-request": Emitido cuando un usuario solicita un préstamo.
Evento: "loan-accepted": Notifica al prestatario cuando el préstamo ha sido aceptado.
Evento: "loan-due-reminder": Envía un recordatorio de devolución a los usuarios.

OneSignal - Revisar