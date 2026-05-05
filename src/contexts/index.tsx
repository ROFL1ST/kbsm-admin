import React from "react";
import { AuthProvider } from "./Auth.Context";
import { PurchaseOrderClientsProvider } from "./PurchaseOrderClient.Context";
import { ProductsProvider } from "./Products.Context";
import { ClientsProvider } from "./Clients.Context";
import { PurchaseOrderVendorsProvider } from "./PurchaseOrderVendors.Context";
import { VendorsProvider } from "./Vendors.Context";
import { FinanceProvider } from "./Finance.context";
import { ParameterProvider } from "./Parameter.context";
import { CompanyProvider } from "./Company.Context";
import { CategoriesProvider } from "./Categories.Context";
import { BanksProvider } from "./Banks.Context";
import { DiscountsProvider } from "./Discounts.Context";
import { ReviewsProvider } from "./Reviews.Context";
import { BlogProvider } from "./Blog.Context";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthProvider>
      <ClientsProvider>
        <VendorsProvider>
          <PurchaseOrderClientsProvider>
            <PurchaseOrderVendorsProvider>
              <ProductsProvider>
                <CategoriesProvider>
                  <DiscountsProvider>
                    <ReviewsProvider>
                      <BanksProvider>
                        <ParameterProvider>
                          <CompanyProvider>
                            <FinanceProvider>
                              <BlogProvider>{children}</BlogProvider>
                            </FinanceProvider>
                          </CompanyProvider>
                        </ParameterProvider>
                      </BanksProvider>
                    </ReviewsProvider>
                  </DiscountsProvider>
                </CategoriesProvider>
              </ProductsProvider>
            </PurchaseOrderVendorsProvider>
          </PurchaseOrderClientsProvider>
        </VendorsProvider>
      </ClientsProvider>
    </AuthProvider>
  );
};
