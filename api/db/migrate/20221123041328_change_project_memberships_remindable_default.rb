class ChangeProjectMembershipsRemindableDefault < ActiveRecord::Migration[7.0]
  def change
    change_column_default(:project_memberships, :remindable, true)
  end
end
