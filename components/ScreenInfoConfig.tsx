import { useState, useCallback } from 'react';
import { Text, View } from './Themed';
import { StyleSheet, TouchableOpacity, FlatList, ListRenderItemInfo, SafeAreaView } from 'react-native';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Constants from 'expo-constants';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import LogoutButton from './botonLogOut';

// Colores para titulos
const lightColorText = 'rgba(0,0,0,0.8)';
const darkColorText = 'rgba(255,255,255,0.8)';

// Color de fondo para estados colapsados o expandidos
const lightColorView = 'rgba(0,0,0,0.05)';
const darkColorView = 'rgba(255,255,255,0.05)';
const lightColorOpen = 'rgba(0,0,0,0.1)';
const darkColorOpen = 'rgba(255,255,255,0.1)';

// Definición de opciones
interface Option {
  id: string;
  title: string;
  icon: string;
  info: string;
}

export const appVersion: string = Constants.expoConfig.version ?? 'Desconocida';

// texto de terminos y condiciones

export const termsAndConditions: string = `Términos y Condiciones

Bienvenido a Allge Care. Al utilizar nuestros servicios, aceptas los siguientes términos y condiciones:

1. Uso de la Aplicación
La aplicación se proporciona "tal cual" sin garantías de ningún tipo. Nos reservamos el derecho de modificar o interrumpir el servicio en cualquier momento sin previo aviso.

2. Responsabilidades del Usuario
Te comprometes a usar la aplicación de manera legal y ética, sin infringir derechos de terceros ni realizar actividades fraudulentas o malintencionadas.

3. Propiedad Intelectual
Otorga permiso gratuito e incondicional para usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y vender el software, siempre que en todas las copias o partes sustanciales se mantenga el aviso de copyright y el permiso.

4. Limitación de Responsabilidad
En ningún caso seremos responsables por daños indirectos, incidentales o consecuenciales que surjan del uso de la aplicación.

5. Modificaciones de los Términos
Podemos actualizar estos términos cuando sea necesario. Publicaremos la versión actualizada en la app y te notificaremos los cambios importantes.

Si no estás de acuerdo con estos términos, por favor, deja de usar la aplicación. Gracias por tu comprensión.
`;

// Texto de licencia
export const mitLicense: string = `MIT License

Copyright (c) ${new Date().getFullYear()} Allge Care

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

//Texto de politica de privacidad

export const privacyPolicy: string = `POLÍTICA DE PRIVACIDAD

La presente Política de Privacidad establece los términos en que Allge Care usa y protege la información que es proporcionada por sus usuarios al momento de utilizar la aplicación móvil. Este equipo de desarrollo está comprometido con la seguridad de los datos de sus usuarios. Cuando solicitamos llenar los campos de información personal con los cuales usted pueda ser identificado, lo hacemos asegurando que solo se empleará de acuerdo con los términos de este documento. Sin embargo, esta Política de Privacidad puede cambiar con el tiempo o ser actualizada por lo que le recomendamos revisar continuamente esta sección dentro de la aplicación para asegurarse de que está de acuerdo con dichos cambios.

INFORMACION QUE ES RECOGIDA

Nuestra aplicación móvil podrá recoger información personal como: nombre, información de contacto como dirección de correo electrónico e información demográfica. Así mismo, cuando sea necesario, podrá ser requerida información específica para procesar algún servicio, funcionalidad de la app o para fines de facturación si correspondiera.

USO DE LA INFORMACION RECOGIDA

La información recopilada a través de nuestra aplicación se utiliza con el fin de proporcionar el mejor servicio posible, particularmente para mantener un registro de usuarios, gestionar funcionalidades internas y mejorar nuestros servicios. En algunos casos, podremos enviar notificaciones dentro de la aplicación, correos electrónicos o mensajes con novedades, información relevante, ofertas o actualizaciones. Usted podrá cancelar la recepción de estas comunicaciones en cualquier momento desde la configuración de la app.

Allge Care está comprometida con mantener su información segura. Utilizamos servidores y bases de datos alojadas en Hostinger, implementando medidas técnicas y organizativas de seguridad para evitar el acceso no autorizado, pérdida o alteración de los datos.

ALMACENAMIENTO DE DATOS

La información personal proporcionada por los usuarios se almacena y gestiona de forma segura a través de los servicios de base de datos de Hostinger. Hostinger cumple con las normativas y estándares de seguridad aplicables para la protección de datos personales.

PERMISOS Y TECNOLOGIAS UTILIZADAS

Nuestra aplicación puede requerir permisos para acceder a funcionalidades de su dispositivo móvil (como cámara, ubicación, almacenamiento, entre otros), siempre solicitando su autorización explícita.

COOKIES Y TECNOLOGIAS SIMILARES

A diferencia de los sitios web, nuestra aplicación móvil no utiliza cookies tradicionales. Sin embargo, puede emplear identificadores únicos y tecnologías similares para mejorar la experiencia de usuario y para fines estadísticos internos.

ENLACES A TERCEROS

La aplicación puede contener enlaces a otros servicios o aplicaciones de terceros que pudieran ser de su interés. Una vez que usted acceda a estos enlaces y abandone nuestra app, ya no tenemos control sobre el servicio al que es redirigido y por lo tanto no somos responsables de los términos o privacidad ni de la protección de sus datos en esos otros servicios. Dichos servicios están sujetos a sus propias políticas de privacidad.

CONTROL DE SU INFORMAICON PERSONAL

En cualquier momento, usted puede solicitar la eliminación de sus datos personales a través de nuestro soporte. No compartiremos, venderemos ni cederemos su información personal a terceros sin su consentimiento, salvo que sea requerido por una autoridad judicial con la debida orden.

Allge Care se reserva el derecho de cambiar los términos de la presente Política de Privacidad en cualquier momento.`
// Opciones de configuración
const options: Option[] = [
  {
    id: '1',
    title: '  Términos y Condiciones',
    icon: 'file-text-o',
    info: termsAndConditions,
  },
  {
    id: '2',
    title: '    Política de privacidad',
    icon: 'lock',
    info: privacyPolicy,
  },
  {
    id: '3',
    title: 'Licencia',
    icon: 'balance-scale',
    info: mitLicense,
  },
  {
    id: '4',
    title: '   Version',
    icon: 'info-circle',
    info: appVersion,
  },
];

export default function ScreenInfoConfig() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const colorScheme = useColorScheme();
  const bgColor = Colors[colorScheme ?? 'light'].background;

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Option>) => {
    const isOpen = expanded.includes(item.id);
    return (
      <View>
        <TouchableOpacity
          style={[styles.item, { backgroundColor: colorScheme === 'dark' ? darkColorView : lightColorView }]}
          onPress={() => toggleExpand(item.id)}
        >
          <FontAwesome name={item.icon as any} size={24} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={styles.title} lightColor={lightColorText} darkColor={darkColorText}>
            {item.title}
          </Text>
          <FontAwesome
            name={isOpen ? 'chevron-up' : 'chevron-right'}
            size={24}
            color={Colors[colorScheme ?? 'light'].text}
            style={{ marginRight: 16 }}
          />
        </TouchableOpacity>
        {isOpen && (
          <View style={[styles.infoContainer, { backgroundColor: colorScheme === 'dark' ? darkColorOpen : lightColorOpen }]}>
            <Text style={styles.info} lightColor={lightColorText} darkColor={darkColorText}>
              {item.info}
            </Text>
          </View>
        )}
      </View>
    );
  }, [expanded, colorScheme]);

  return (
    <SafeAreaView style={[styles.Container, { backgroundColor: bgColor }]}>
      <FlatList<Option>
        data={options}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={{ paddingVertical: 8 }}>
            <LogoutButton />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    marginTop: 8,
    paddingBottom: 40,
    marginBottom: 2,
  },
  Text: {
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e0e0e0',
    marginLeft: 64,
  },
  infoContainer: {
    paddingVertical: 8,
  },
  info: {
    fontSize: 14,
    marginHorizontal: 12,
    color: '#606060',
  },
});

