"use client";

import { useCallback, useState } from "react";
import { StaffCreateForm } from "@/components/admin/StaffCreateForm";
import { StaffEditForm } from "@/components/admin/StaffEditForm";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/ui/PageHeader";

type RoleOption = { id: string; name: string };

type Member = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  isSelf: boolean;
  editable: boolean;
  lastLoginLabel: string | null;
};

export function StaffWorkspace({
  members,
  roles,
  canManage,
}: {
  members: Member[];
  roles: RoleOption[];
  canManage: boolean;
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);

  const closeCreate = useCallback(() => setCreateOpen(false), []);
  const closeEdit = useCallback(() => setEditing(null), []);

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Staff"
        description={
          canManage
            ? "Each person gets one role. What they can see and change comes from that role’s permissions."
            : "Your role can view staff but not change them."
        }
        action={
          canManage && roles.length > 0 ? (
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="w-full shrink-0 sm:w-auto"
            >
              Add staff member
            </Button>
          ) : undefined
        }
      />

      <ul className="overflow-hidden rounded-xl border border-line bg-white">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-col gap-4 border-b border-line px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-navy">
                  {member.name}
                  {member.isSelf ? " (you)" : ""}
                </p>
                {member.isActive ? null : <Badge tone="danger">Disabled</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted">{member.email}</p>
              <p className="mt-1 text-sm text-muted">
                {member.roleName}
                {member.lastLoginLabel
                  ? ` · last sign-in ${member.lastLoginLabel}`
                  : " · never signed in"}
              </p>
            </div>

            {member.editable ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full shrink-0 sm:w-auto"
                onClick={() => setEditing(member)}
              >
                Edit
              </Button>
            ) : (
              <span className="text-sm text-muted">
                {member.isSelf ? "Your account" : "View only"}
              </span>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={createOpen}
        onClose={closeCreate}
        title="Add staff member"
        description="They can sign in to the admin area with the temporary password you set."
        size="lg"
      >
        <StaffCreateForm
          roles={roles}
          onCancel={closeCreate}
          onSuccess={closeCreate}
        />
      </Modal>

      <Modal
        open={Boolean(editing)}
        onClose={closeEdit}
        title="Edit staff member"
        description="Changing role, password, or active status signs them out of other sessions."
        size="md"
      >
        {editing ? (
          <StaffEditForm
            member={editing}
            roles={roles}
            onCancel={closeEdit}
            onSuccess={closeEdit}
          />
        ) : null}
      </Modal>
    </div>
  );
}
