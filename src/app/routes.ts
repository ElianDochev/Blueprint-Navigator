export type AppRoute =
  | { name: "dashboard" }
  | { name: "create_project" }
  | { name: "project_upload"; projectId: string };

export function parseAppRoute(pathname: string): AppRoute {
  if (pathname === "/" || pathname === "/dashboard") {
    return { name: "dashboard" };
  }

  if (pathname === "/projects/new") {
    return { name: "create_project" };
  }

  const match = pathname.match(/^\/projects\/(?<projectId>[^/]+)\/upload$/);
  if (match?.groups?.projectId) {
    return {
      name: "project_upload",
      projectId: decodeURIComponent(match.groups.projectId)
    };
  }

  return { name: "dashboard" };
}

export function dashboardPath(): string {
  return "/";
}

export function createProjectPath(): string {
  return "/projects/new";
}

export function projectUploadPath(projectId: string): string {
  return `/projects/${encodeURIComponent(projectId)}/upload`;
}
