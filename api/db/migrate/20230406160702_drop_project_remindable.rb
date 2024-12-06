# frozen_string_literal: true

class DropProjectRemindable < ActiveRecord::Migration[7.0]
  def change
    drop_table(:project_remindables, id: { type: :bigint, unsigned: true }) do |t|
      t.references(:project, null: false, unsigned: true)
      t.references(:organization_membership, null: false, unsigned: true)
      t.string(:public_id, limit: 12, null: false, index: { unique: true })
      t.timestamps
    end
  end
end
