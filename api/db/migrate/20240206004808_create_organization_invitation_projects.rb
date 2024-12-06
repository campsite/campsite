class CreateOrganizationInvitationProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :organization_invitation_projects, id: { type: :bigint, unsigned: true } do |t|
      t.references :project, null: false, unsigned: true
      t.references :organization_invitation, null: false, unsigned: true

      t.timestamps
    end
  end
end
