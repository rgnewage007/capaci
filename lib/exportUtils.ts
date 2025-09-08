import * as XLSX from 'xlsx';

export interface ExportData {
    [key: string]: string | number | boolean | null;
}

export function exportToExcel(data: ExportData[], filename: string) {
    if (!data || data.length === 0) {
        console.warn('No hay datos para exportar');
        return;
    }

    try {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(data);

        const columnWidths = Object.keys(data[0]).map(key => ({
            wch: Math.max(key.length, 15)
        }));
        worksheet['!cols'] = columnWidths;

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
    }
}

export function exportUsersToExcel(users: any[]) {
    const exportData = users.map(user => ({
        'ID': user.id,
        'Nombre': user.first_name || '',
        'Apellido': user.last_name || '',
        'Email': user.email || '',
        'Rol': getRoleLabel(user.role),
        'Estado': getStatusLabel(user.status),
        'Fecha de Registro': user.created_at ? formatDate(user.created_at) : '',
        'Última Actualización': user.updated_at ? formatDate(user.updated_at) : ''
    }));

    exportToExcel(exportData, `usuarios_${formatDateForFilename()}`);
}

export function exportCoursesToExcel(courses: any[]) {
    const exportData = courses.map(course => ({
        'ID': course.id,
        'Título': course.title,
        'Descripción': course.description || '',
        'Duración (min)': course.duration || 0,
        'Activo': course.isActive ? 'Sí' : 'No',
        'Categoría': course.category || '',
        'Nivel': course.level || '',
        'Fecha de Creación': course.created_at ? formatDate(course.created_at) : ''
    }));

    exportToExcel(exportData, `cursos_${formatDateForFilename()}`);
}

export function exportCertificatesToExcel(certificates: any[]) {
    const exportData = certificates.map(cert => ({
        'Número de Certificado': cert.certificate_number,
        'Estudiante': cert.user_first_name && cert.user_last_name
            ? `${cert.user_first_name} ${cert.user_last_name}`
            : '',
        'Curso': cert.course_title || '',
        'Emisor': cert.issued_by,
        'Puntuación': `${cert.score}%`,
        'Fecha de Emisión': cert.issued_at ? formatDate(cert.issued_at) : '',
        'Fecha de Expiración': cert.expiration_date ? formatDate(cert.expiration_date) : '',
        'Estado': getValidityStatusLabel(cert.validity_status)
    }));

    exportToExcel(exportData, `certificados_${formatDateForFilename()}`);
}

// Funciones auxiliares
function formatDate(dateString: string): string {
    try {
        return new Date(dateString).toLocaleDateString('es-ES');
    } catch {
        return dateString;
    }
}

function formatDateForFilename(): string {
    return new Date().toISOString().split('T')[0].replace(/-/g, '');
}

function getRoleLabel(role: string): string {
    switch (role) {
        case "admin": return "Administrador";
        case "instructor": return "Instructor";
        case "student": return "Estudiante";
        default: return role;
    }
}

function getStatusLabel(status: string): string {
    switch (status) {
        case "active": return "Activo";
        case "inactive": return "Inactivo";
        case "suspended": return "Suspendido";
        default: return status;
    }
}

function getValidityStatusLabel(status: string): string {
    switch (status) {
        case "valid": return "Válido";
        case "expiring_soon": return "Próximo a vencer";
        case "expired": return "Expirado";
        default: return status;
    }
}