# frozen_string_literal: true

class EnablePolymorphicResourceOwner < ActiveRecord::Migration[7.1]
  def change
    # all keys currently belong to users, so we'll make that the default.
    # after this migration we'll update the backend to make the User association explicit,
    # then we'll drop the default value in a subsequent migration.
    add_column :oauth_access_tokens, :resource_owner_type, :string, default: 'User', null: false

    add_index :oauth_access_tokens, [:resource_owner_id, :resource_owner_type], name: 'polymorphic_owner_oauth_access_tokens'
  end
end
