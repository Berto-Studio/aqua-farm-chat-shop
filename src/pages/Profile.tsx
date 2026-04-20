import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, ShoppingBag, Map, Clock } from "lucide-react";
import { useUserStore } from "@/store/store";
import { GetUserOrders } from "@/services/orders";
import OrderDetailsModal from "@/components/orders/OrderDetailsModal";
import { Link } from "react-router-dom";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .number()
    .min(10, { message: "Phone number must be at least 10 digits." }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Profile() {
  const { user } = useUserStore();
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [order, setOrder] = useState<OrderProps | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.full_name,
      email: user.email,
      phone: user.phone_number,
    },
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
  }

  const getUserOrders = async () => {
    const response = await GetUserOrders();
    if (response.success) {
      setOrders(response.data || []);
    } else {
      console.error("Failed to fetch user orders:", response.message);
    }
  };

  const total_orders = orders.length;

  useEffect(() => {
    getUserOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-6 rounded-full mb-2">
                <User className="h-12 w-12 text-primary" />
              </div>
              <CardTitle>{user.full_name}</CardTitle>
              {/* <CardDescription>Customer since May 2025</CardDescription> */}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{total_orders} Orders</span>
              </div>
              <div className="flex items-center">
                <Map className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{user.address}</span>
              </div>
              {user.user_type === "farmer" && (
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Registed Farmer</span>
                </div>
              )}
              {/* <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Active buyer</span>
              </div> */}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="profile">Profile Details</TabsTrigger>
              <TabsTrigger value="orders">Order History</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" disabled />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex flex-col gap-4">
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} disabled />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Link to={"/settings"} className="">
                          <Button>Go to Settings</Button>
                        </Link>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    View all your previous orders here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Order ID</th>
                          <th className="text-left py-3 px-2">Date</th>
                          <th className="text-left py-3 px-2">Status</th>
                          <th className="text-left py-3 px-2">Total</th>
                          <th className="text-right py-3 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order, index) => (
                          <tr
                            key={order.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-2">{index + 1}</td>
                            <td className="py-3 px-2">{order.created_at}</td>
                            <td className="py-3 px-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  order.status === "Delivered"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              GHS {order.total_price}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setIsModalOpen(true);
                                  setOrder(order);
                                }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {/* Order Details Modal */}
      {order && (
        <OrderDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setOrder(null);
          }}
          order={order}
        />
      )}
    </div>
  );
}
