// ===============================================================
// PaymentContainer.jsx
// Muestra los pagos confirmados sin permitir altas/ediciones manuales.
// ===============================================================
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:4000/api';

export default function PaymentContainer() {
  const [pagos, setPagos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPagos();
  }, []);

  // Trae los pagos desde el backend e incorpora datos formateados
  const loadPagos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/pagos`);
      const decorated = data.map((pago) => {
        const medicoNombre = [pago.medico_nombre, pago.medico_apellido]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin asignar';
        const pacienteNombre = [pago.paciente_nombre, pago.paciente_apellido]
          .filter(Boolean)
          .join(' ')
          .trim() || 'Sin asignar';

        return {
          ...pago,
          turnoFechaBonita: pago.fecha ? new Date(pago.fecha).toLocaleDateString() : '—',
          turnoHoraCorta: pago.hora ? pago.hora.slice(0, 5) : '—',
          medicoNombre,
          especialidad: pago.medico_especialidad || 'Sin especialidad',
          pacienteNombre,
        };
      });
      setPagos(decorated);
    } catch (error) {
      console.error('Error al cargar pagos', error);
      alert('No se pudieron cargar los pagos.');
    } finally {
      setLoading(false);
    }
  };

  const pagosFiltrados = useMemo(() => {
    const term = search.toLowerCase();
    return pagos.filter((pago) => {
      const blob = [
        pago.medicoNombre,
        pago.especialidad,
        pago.pacienteNombre,
        pago.tipo,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return blob.includes(term);
    });
  }, [pagos, search]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <div className="payment-container">
      <div className="mb-4">
        <h5 className="text-primary mb-1">Pagos registrados</h5>
        <small className="text-muted">
          Información consolidada de los cobros generados automáticamente junto al turno.
        </small>
      </div>

      <div className="input-group mb-3">
        <span className="input-group-text">Buscar</span>
        <input
          type="text"
          className="form-control"
          placeholder="Filtra por médico, especialidad, paciente o tipo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Turno</th>
              <th>Médico</th>
              <th>Especialidad</th>
              <th>Paciente</th>
              <th>Monto</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((pago) => (
              <tr key={pago.id}>
                <td>
                  {pago.turnoFechaBonita} {pago.turnoHoraCorta}
                </td>
                <td>{pago.medicoNombre}</td>
                <td>{pago.especialidad}</td>
                <td>{pago.pacienteNombre}</td>
                <td>{formatCurrency(pago.monto)}</td>
                <td>{pago.tipo}</td>
              </tr>
            ))}
            {!pagosFiltrados.length && (
              <tr>
                <td colSpan="6" className="text-center text-muted">
                  No hay pagos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <p className="text-center text-muted mt-3">Cargando...</p>}
    </div>
  );
}
