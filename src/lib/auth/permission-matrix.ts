import { getPermissionGroups } from "@/lib/auth/permissions";

/** Action columns in the role permission matrix (Full is derived per row). */
export const permissionActionColumns = [
  { id: "full", label: "Full" },
  { id: "view", label: "View" },
  { id: "manage", label: "Manage" },
] as const;

export type MatrixCell = {
  key: string;
  grantable: boolean;
};

export type MatrixRow = {
  label: string;
  cells: Partial<Record<"view" | "manage", MatrixCell>>;
};

/**
 * Flatten permission groups into matrix rows.
 * Team becomes Staff + Roles so empty cells stay sparse like the reference UI.
 */
export function buildPermissionMatrix(
  grantable: (key: string) => boolean,
): MatrixRow[] {
  const rows: MatrixRow[] = [];

  for (const group of getPermissionGroups()) {
    if (group.label === "Team") {
      const staffView = group.items.find((i) => i.key === "staff.view");
      const staffManage = group.items.find((i) => i.key === "staff.manage");
      const rolesManage = group.items.find((i) => i.key === "roles.manage");

      if (staffView || staffManage) {
        rows.push({
          label: "Staff",
          cells: {
            ...(staffView
              ? {
                  view: {
                    key: staffView.key,
                    grantable: grantable(staffView.key),
                  },
                }
              : {}),
            ...(staffManage
              ? {
                  manage: {
                    key: staffManage.key,
                    grantable: grantable(staffManage.key),
                  },
                }
              : {}),
          },
        });
      }

      if (rolesManage) {
        rows.push({
          label: "Roles",
          cells: {
            manage: {
              key: rolesManage.key,
              grantable: grantable(rolesManage.key),
            },
          },
        });
      }
      continue;
    }

    const cells: MatrixRow["cells"] = {};
    for (const item of group.items) {
      if (item.key.endsWith(".view")) {
        cells.view = { key: item.key, grantable: grantable(item.key) };
      } else if (item.key.endsWith(".manage")) {
        cells.manage = { key: item.key, grantable: grantable(item.key) };
      }
    }

    rows.push({ label: group.label, cells });
  }

  return rows;
}
