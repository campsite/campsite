# frozen_string_literal: true

class StripePrice
  NAMES = [
    ESSENTIALS_MONTHLY_NAME = "essentials_monthly",
    ESSENTIALS_ANNUAL_NAME = "essentials_annual",
    PRO_MONTHLY_NAME = "pro_monthly",
    PRO_ANNUAL_NAME = "pro_annual",
  ]

  def self.all
    {
      ESSENTIALS_MONTHLY_NAME => Rails.env.production? ? "price_1Q9rWULhPxZt87Oma7b3erYp" : "price_1Q9rZ1LhPxZt87OmISwTp0Q9",
      ESSENTIALS_ANNUAL_NAME => Rails.env.production? ? "price_1Q9rWvLhPxZt87Omc18MCew3" : "price_1Q9rZJLhPxZt87OmKJcR9FkM",
      PRO_MONTHLY_NAME => Rails.env.production? ? "price_1Pj9zhLhPxZt87OmkgDTxpOW" : "price_1PgYQFLhPxZt87Omg1CLXm8c",
      PRO_ANNUAL_NAME => Rails.env.production? ? "price_1PjA0XLhPxZt87OmTiUWX4Td" : "price_1PiPqoLhPxZt87OmLQTJ3uNY",
    }
  end

  def self.by_name!(name)
    all.fetch(name)
  end
end
