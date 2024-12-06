class CreateIntegrationIssues < ActiveRecord::Migration[7.0]
  def change
    create_table :integration_issues do |t|
      t.references :subject, polymorphic: true, unsigned: true, null: false
      t.string :service, null: false
      t.bigint :organization_membership_id, unsigned: true, null: false
      t.json :data

      t.timestamps
    end
  end
end
