const GUEST_ROUTES: (string | RegExp)[] = ["/", "/cambiar-contrasenia"];

const ADMIN_ROUTES: (string | RegExp)[] = [
    "/usuarios",
    "/usuarios/nuevo",
    /^\/usuarios\/edicion\/[^/]+$/,
];

const WORKER_ROUTES: (string | RegExp)[] = [
    "/entregas-recepciones-realizadas",
    "/entregas-recepciones-realizadas/nueva",
    /^\/entregas-recepciones-realizadas\/edicion\/[^/]+$/,
    "/entregas-recepciones-recibidas",
];

const ZONE_MANAGER_ROUTES: (string | RegExp)[] = [
    "/entregas-recepciones-pendientes",
    /^\/entregas-recepciones-pendientes\/[^/]+$/,
    "/entregas-recepciones-en-proceso",
    /^\/entregas-recepciones-en-proceso\/[^/]+$/,
    "/entregas-recepciones-liberadas",
    /^\/entregas-recepciones-liberadas\/[^/]+$/,
];

const WITNESS_ROUTES: (string | RegExp)[] = ["/"];

export {
    GUEST_ROUTES,
    ADMIN_ROUTES,
    WORKER_ROUTES,
    ZONE_MANAGER_ROUTES,
    WITNESS_ROUTES,
};
