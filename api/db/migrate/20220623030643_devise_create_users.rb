# frozen_string_literal: true

class DeviseCreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users, id: { type: :bigint, unsigned: true } do |t|
      t.string :username
      t.string :name
      t.string :public_id, null: false, limit: 12
      t.string :avatar_path

      ## Database authenticatable
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable
      t.datetime :remember_created_at

      ## Confirmable
      t.string   :confirmation_token
      t.datetime :confirmed_at
      t.datetime :confirmation_sent_at
      t.string   :unconfirmed_email # Only if using reconfirmable

      # Omniauth
      t.string :omniauth_provider
      t.string :omniauth_uid

      # onboarding
      t.datetime :onboarded_at

      t.timestamps null: false
    end

    add_index :users, :username,             unique: true
    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :confirmation_token,   unique: true
    add_index :users, :public_id,            unique: true
    add_index :users, [:omniauth_provider, :omniauth_uid], unique: true
  end
end
