# frozen_string_literal: true

class CreatePreferences < ActiveRecord::Migration[7.0]
  def change
    create_table(:preferences, id: { type: :bigint, unsigned: true }) do |t|
      t.bigint(:subject_id, unsigned: true, null: false)
      t.string(:subject_type, null: false)
      t.string(:key, null: false)
      t.string(:value, null: false)

      t.timestamps
    end
    add_index(:preferences, :key)
    add_index(:preferences, [:subject_id, :subject_type])
    add_index(:preferences, [:subject_id, :subject_type, :key], unique: true)
  end
end
