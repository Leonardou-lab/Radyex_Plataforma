"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Check, ChevronRight, Inbox, Stethoscope, UserPlus } from "lucide-react";
import type { SolicitudParaRevision } from "@/lib/mapeo-solicitudes";
import { RevisionModal } from "./RevisionModal";

type ListaSolicitudesProps = {
  solicitudes: SolicitudParaRevision[];
  avatarIniciales: string;
};

/**
 * Pantalla "Solicitudes" del panel interno: la cola de órdenes que los
 * doctores enviaron y que el equipo todavía no procesa.
 *
 * Es el paso que falta para que una solicitud se convierta en orden: hasta
 * que alguien la aprueba aquí, `ordenes` no tiene la fila y el doctor la ve
 * como "En revisión" en su pantalla.
 */
export function ListaSolicitudes({ solicitudes, avatarIniciales }: ListaSolicitudesProps) {
  const [abierta, setAbierta] = useState<SolicitudParaRevision | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const router = useRouter();

  function alResolver(mensaje: string) {
    setAbierta(null);
    setAviso(mensaje);
    // Las Server Actions ya hicieron revalidatePath; refrescar la ruta hace
    // que la lista se vuelva a pedir al servidor y la solicitud resuelta
    // desaparezca de la cola.
    router.refresh();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Solicitudes</div>
          <div className="page-sub">
            Órdenes que los doctores enviaron y están esperando revisión
          </div>
        </div>
        <div className="topbar-actions">
          <div className="avatar">{avatarIniciales}</div>
        </div>
      </div>

      <div className="content">
        {aviso && (
          <div className="aviso-exito">
            <Check size={16} strokeWidth={2.4} />
            {aviso}
          </div>
        )}

        {solicitudes.length === 0 ? (
          <div className="panel" style={{ textAlign: "center", padding: "48px 30px" }}>
            <div
              className="dropzone-icon"
              style={{ background: "var(--success-soft)", color: "var(--success)" }}
            >
              <Inbox size={26} strokeWidth={2} />
            </div>
            <p className="font-display text-[15px] font-semibold text-[var(--ink)]">
              No hay solicitudes pendientes
            </p>
            <p className="mt-1.5 text-[13.5px] text-[var(--text-muted)]">
              Cuando un doctor envíe una orden nueva, aparecerá aquí para revisarla.
            </p>
          </div>
        ) : (
          <div className="order-list">
            {solicitudes.map((s) => (
              <div
                key={s.id}
                className="order-card status-pending"
                role="button"
                tabIndex={0}
                onClick={() => setAbierta(s)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setAbierta(s);
                }}
              >
                <div className="order-avatar">{s.iniciales}</div>
                <div className="order-main">
                  <div className="order-name">{s.nombrePaciente}</div>
                  <div className="order-meta">
                    <div className="order-meta-item">
                      <Stethoscope size={13} strokeWidth={2} />
                      {s.doctorNombre}
                    </div>
                    <div className="order-meta-item">
                      <Calendar size={13} strokeWidth={2} />
                      {s.fechaSolicitud}
                    </div>
                    {/* Señal de que esta revisión pide deduplicar: el doctor
                        tecleó los datos, hay que ver si ya existe. */}
                    {s.datosTecleados && (
                      <div className="order-meta-item">
                        <UserPlus size={13} strokeWidth={2} />
                        Paciente nuevo
                      </div>
                    )}
                  </div>
                </div>
                <div className="revision-pill">
                  <span className="dot" />
                  <span>Pendiente</span>
                </div>
                <ChevronRight className="chevron" size={18} strokeWidth={2} />
              </div>
            ))}
          </div>
        )}
      </div>

      {abierta && (
        <RevisionModal
          solicitud={abierta}
          onCerrar={() => setAbierta(null)}
          onResuelta={alResolver}
        />
      )}
    </>
  );
}
