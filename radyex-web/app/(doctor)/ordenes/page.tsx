import { getCurrentDoctor, getOrdersByDoctor, initials, CURRENT_DOCTOR_ID } from "@/lib/data";
import { OrderList } from "@/components/ordenes/OrderList";

// Pantalla "Mis órdenes" — plantilla de migración de la fase 1 (ver
// docs/migracion-nextjs.md). Este archivo (Server Component, sin
// "use client") solo lee los datos del seed local y se los pasa por
// props a OrderList, que es quien maneja la interacción (búsqueda,
// filtros, modal). Separar "quién trae los datos" de "quién
// interactúa con ellos" es el mismo patrón que van a seguir las
// pantallas que se migren después.
export default function OrdenesPage() {
  const doctor = getCurrentDoctor();
  const orders = getOrdersByDoctor(CURRENT_DOCTOR_ID);

  return <OrderList orders={orders} doctorIniciales={doctor ? initials(doctor.name) : ""} />;
}
