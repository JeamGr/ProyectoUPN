import ExcelJS from 'exceljs';
import { InscritoListadoDTO } from '../application/InscripcionDTO';

// RF-030: exportación del listado de inscritos en Excel real (.xlsx),
// según lo acordado con el usuario ("Excel real (.xlsx)").
export class ExcelExportBuilder {
    static async construirListadoInscritos(
        tituloOportunidad: string,
        inscritos: InscritoListadoDTO[]
    ): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const hoja = workbook.addWorksheet('Inscritos');

        hoja.columns = [
            { header: 'Código estudiante', key: 'codigo_estudiante', width: 20 },
            { header: 'Nombres', key: 'nombres', width: 20 },
            { header: 'Apellidos', key: 'apellidos', width: 20 },
            { header: 'Correo', key: 'correo', width: 30 },
            { header: 'Teléfono', key: 'telefono', width: 15 },
            { header: 'Estado', key: 'estado', width: 15 },
            { header: 'Fecha de inscripción', key: 'fecha_inscripcion', width: 22 }
        ];

        hoja.getRow(1).font = { bold: true };

        inscritos.forEach((inscrito) => {
            hoja.addRow({
                codigo_estudiante: inscrito.codigo_estudiante,
                nombres: inscrito.nombres,
                apellidos: inscrito.apellidos,
                correo: inscrito.correo,
                telefono: inscrito.telefono ?? '',
                estado: inscrito.estado,
                fecha_inscripcion: inscrito.fecha_inscripcion
            });
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}
