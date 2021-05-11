import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const dateFormat = (date: string): string => {
  return format(new Date(date), 'PP', {
    locale: ptBR,
  });
};

export default dateFormat;
