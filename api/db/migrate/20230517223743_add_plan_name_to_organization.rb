class AddPlanNameToOrganization < ActiveRecord::Migration[7.0]
  def change
    add_column :organizations, :plan_name, :string, default: "free", null: false
  end
end
