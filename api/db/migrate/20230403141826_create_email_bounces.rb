# frozen_string_literal: true

class CreateEmailBounces < ActiveRecord::Migration[7.0]
  def change
    create_table(:email_bounces, id: { type: :bigint, unsigned: true }) do |t|
      t.string(:email, null: false, index: { unique: true })
      t.timestamps
    end
  end
end
