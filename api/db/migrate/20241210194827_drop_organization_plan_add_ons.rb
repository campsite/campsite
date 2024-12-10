class DropOrganizationPlanAddOns < ActiveRecord::Migration[7.2]
  def change
    drop_table "organization_plan_add_ons", id: { type: :bigint, unsigned: true } do |t|
      t.bigint "organization_id", null: false
      t.string "plan_add_on_name", null: false
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["organization_id", "plan_add_on_name"], name: "idx_org_plan_add_ons_on_org_and_name", unique: true
      t.index ["organization_id"], name: "index_organization_plan_add_ons_on_organization_id"
    end
  end
end
