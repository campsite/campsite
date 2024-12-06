class MakeProjectsInviteTokenNonNullable < ActiveRecord::Migration[7.2]
  def change
    if Rails.env.development? && !ENV['ENABLE_PSDB']
      Project.where(invite_token: nil).find_each do |project|
        project.update_columns(invite_token: project.generate_unique_token(attr_name: :invite_token)) 
      end
    end

    change_column_null :projects, :invite_token, false
  end
end
