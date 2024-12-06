class CreateIntegrationChannels < ActiveRecord::Migration[7.0]
  def change
    create_table(:integration_channels, id: { type: :bigint, unsigned: true }) do |t|
      t.string(:provider_channel_id, null: false)
      t.string(:name, null: false)
      t.boolean(:private, null: false, default: false)
      t.references(:integration, null: false, unsigned: true)

      t.timestamps
    end
    add_index :integration_channels, :name
  end
end
