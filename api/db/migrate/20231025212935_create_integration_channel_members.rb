class CreateIntegrationChannelMembers < ActiveRecord::Migration[7.0]
  def change
    create_table :integration_channel_members, id: { type: :bigint, unsigned: true } do |t|
      t.string :provider_member_id, null: false, index: true
      t.bigint :integration_channel_id, unsigned: true, null: false, index: true

      t.timestamps
    end

    add_index :integration_channel_members, [:provider_member_id, :integration_channel_id], unique: true, name: 'index_integration_channel_members_on_member_and_channel'
  end
end
