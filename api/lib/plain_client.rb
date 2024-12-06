# frozen_string_literal: true

class PlainClient
  class GraphQLError < StandardError; end
  class CustomerAlreadyExistsWithEmailError < StandardError; end

  def initialize(api_key:)
    @api_key = api_key
  end

  def upsert_customer(external_id:, full_name:, short_name:, email:, email_is_verified: true, identifier: :external_id)
    mutation = <<~GRAPHQL
      mutation UpsertCustomer($upsertCustomerInput: UpsertCustomerInput!) {
        upsertCustomer(input: $upsertCustomerInput) {
          result
          error {
            fields {
              message
            }
          }
        }
      }
    GRAPHQL

    identifier_variable = case identifier
    when :external_id
      { externalId: external_id }
    when :email_address
      { emailAddress: email }
    else
      raise "Unexpected identifier: #{identifier}"
    end

    variables = {
      upsertCustomerInput: {
        identifier: identifier_variable,
        onCreate: {
          externalId: external_id,
          fullName: full_name,
          shortName: short_name,
          email: {
            email: email,
            isVerified: email_is_verified,
          },
        },
        onUpdate: {
          externalId: {
            value: external_id,
          },
          fullName: {
            value: full_name,
          },
          shortName: {
            value: short_name,
          },
          email: {
            email: email,
            isVerified: email_is_verified,
          },
        },
      },
    }

    graphql_query(mutation, variables).body
  end

  def create_thread(customer_external_id:, title:, components: [], label_type_ids:)
    mutation = <<~GRAPHQL
      mutation CreateThread($createThreadInput: CreateThreadInput!) {
        createThread(input: $createThreadInput) {
          thread {
            id
          }
          error {
            fields {
              message
            }
          }
        }
      }
    GRAPHQL

    variables = {
      createThreadInput: {
        customerIdentifier: {
          externalId: customer_external_id,
        },
        title: title,
        components: components.map(&:to_h),
        labelTypeIds: label_type_ids,
      },
    }

    graphql_query(mutation, variables).body
  end

  private

  def graphql_query(query, variables)
    response = connection.post("/graphql/v1", { query: query, variables: variables }.to_json)

    error = response.body["data"]&.values&.dig(0, "error")

    if error.present?
      if error.dig("fields").pluck("message").include?("A customer already exists with the provided email address")
        raise PlainClient::CustomerAlreadyExistsWithEmailError, error
      else
        raise GraphQLError, "GraphQL error: #{error}"
      end
    end

    response
  end

  def connection
    @connection ||= Faraday.new(
      url: "https://core-api.uk.plain.com",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer #{@api_key}",
      },
    ) do |f|
      f.response(:raise_error)
      f.response(:json)
    end
  end
end
