class ChangeDefaultOrganizationPlanNameToPro < ActiveRecord::Migration[7.2]
  def change
    change_column_default :organizations, :plan_name, from: "free", to: "pro"
  end
end
