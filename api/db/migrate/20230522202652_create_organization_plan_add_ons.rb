class CreateOrganizationPlanAddOns < ActiveRecord::Migration[7.0]
  def change
    create_table :organization_plan_add_ons, id: { type: :bigint, unsigned: true } do |t|
      t.references :organization, null: false
      t.string :plan_add_on_name, null: false

      t.timestamps
    end

    add_index :organization_plan_add_ons, [:organization_id, :plan_add_on_name], unique: true, name: "idx_org_plan_add_ons_on_org_and_name"
  end
end
