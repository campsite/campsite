class AddDiscordIntegrationSupport < ActiveRecord::Migration[7.1]
  def change
    # Add Discord-specific columns to organizations
    add_column :organizations, :discord_guild_id, :string
    add_index :organizations, :discord_guild_id

    # Add Discord-specific columns to projects
    add_column :projects, :discord_channel_id, :string
    add_index :projects, :discord_channel_id

    # Add Discord username to users
    add_column :users, :discord_username, :string
    add_index :users, :discord_username

    # Create Discord events table for webhook handling
    create_table :discord_events do |t|
      t.string :event_type, null: false
      t.string :event_id
      t.json :payload
      t.datetime :processed_at

      t.timestamps
    end

    add_index :discord_events, :event_id, unique: true
    add_index :discord_events, [:event_type, :created_at]
  end
end