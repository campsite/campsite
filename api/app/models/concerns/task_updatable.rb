# frozen_string_literal: true

module TaskUpdatable
  extend ActiveSupport::Concern

  def update_checked_task(content:, index:, checked:)
    parsed = Nokogiri::HTML.fragment(content)

    lis = parsed.css('li:has(input[type="checkbox"])')

    if index >= 0 && index < lis.length
      lis[index].set_attribute("data-checked", checked)

      inputs = parsed.css('input[type="checkbox"]')
      if checked
        inputs[index].set_attribute("checked", checked ? "checked" : nil)
      else
        inputs[index].remove_attribute("checked")
      end
    end

    parsed.to_s
  end
end
