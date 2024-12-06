class CreateFlipperAuditLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :flipper_audit_logs, id: { type: :bigint, unsigned: true } do |t|
      t.references :user, unsigned: true
      t.string :operation, null: false
      t.string :feature_name, null: false
      t.boolean :result, null: false
      t.string :gate_name
      t.json :thing
      t.json :gate_values_snapshot

      t.timestamps
    end
  end
end
