class MakeMessageThreadOwnerPolymorphic < ActiveRecord::Migration[7.2]
  def change
    add_column :message_threads, :owner_type, :string, default: 'OrganizationMembership', null: false

    add_index :message_threads, [:owner_id, :owner_type], name: 'index_message_threads_on_owner'
  end
end
