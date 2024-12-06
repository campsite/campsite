# frozen_string_literal: true

class DropProjectsProjectMembersCount < ActiveRecord::Migration[7.0]
  def change
    remove_column(:projects, :project_members_count, :integer, default: 0, null: false)
  end
end
